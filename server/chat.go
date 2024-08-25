package server

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"slices"
	"strings"
	"sync"

	"github.com/PuerkitoBio/goquery"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var websocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Manager struct {
	Clients ClientList
	sync.RWMutex
}

func (m *Manager) ServeChat(w http.ResponseWriter, r *http.Request) {
	log.Println("Chat: new connection")

	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{
		connection: conn,
		manager:    m,
	}

	m.addClient(client)

	go client.chatHandler()
}

func (m *Manager) addClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	m.Clients[client] = true
}

func (m *Manager) removeClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	if _, ok := m.Clients[client]; ok {
		client.connection.Close()
		delete(m.Clients, client)
	}
}

// clients
type Client struct {
	connection *websocket.Conn
	manager    *Manager

	// avoid concurrent writes on websocket connection
	egress chan []byte
}

type ClientList map[*Client]bool

func NewClient(conn *websocket.Conn, manager *Manager) *Client {
	return &Client{
		connection: conn,
		manager:    manager,
	}
}

func getChat() []byte {
	path := AssetsPath + "/chat.json"
	if !fileExists(path) {
		fmt.Println(path + " does not exist! Creating template chat.json file...")
		os.Create(path)
	}

	chatBin, err := os.ReadFile(path)
	if err != nil {
		log.Println("Error reading chat.json:", err)
	}

	if string(chatBin) == "" {
		chatBin := []byte(`[]`)
		if err := os.WriteFile(path, chatBin, 0777); err != nil {
			log.Println("Error creating chat.json")
		}
	}

	return chatBin
}

func (c *Client) chatHandler() {
	for {
		_, response, err := c.connection.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("Error reading message!", err)
			}
			break
		}

		var message map[string]string
		err = json.Unmarshal(response, &message)
		if err != nil {
			log.Println("Error parsing JSON: ", err)
			break
		}

		chatBin := getChat()

		switch message["type"] {
		case "chatPostMessage":
			var obj []map[string]string
			err = json.Unmarshal(chatBin, &obj)
			if err != nil {
				log.Println("Error:", err)
				return
			}

			username := ValidateUser(message["sender"])
			if username != "__userinvalid" {
				message["sender"] = username
			} else {
				log.Println("Failed to validate user")
				return
			}

			path := AssetsPath + "/chat.json"
			if _, err := os.Stat(path); os.IsNotExist(err) {
				log.Println(path + " does not exist! Creating template...")
				if err := os.Mkdir(path, 0777); err != nil {
					log.Println("Could not create template")
					return
				}
			}
			if message["dataType"] == "img" {
				b64IMG := message["content"]
				var fileName string
				if imgType := b64IMG[strings.Index(b64IMG, "/")+1 : strings.Index(b64IMG, ";")]; slices.Contains([]string{"png", "jpeg", "jpg"}, imgType) {
					fileName = "/" + uuid.New().String() + ".tmp"
					defer convertImage(fileName)
				} else {
					fileName = "/" + uuid.New().String() + "." + imgType
				}

				b64IMG = strings.Split(b64IMG, ";base64,")[1]

				imgBin, err := base64.StdEncoding.DecodeString(b64IMG)
				if err != nil {
					log.Println("Could not decode image base64 to bytes:", err)
				}

				if err := os.WriteFile(PubAssetsPath+"/chat"+fileName, imgBin, 0777); err != nil {
					log.Println("chatHandler: Could not write image to", fileName)
					return
				}

				message["content"] = "/assets/chat" + fileName
			} else if message["dataType"] == "file" {
				bytes := []byte(message["content"])
				var fileName string
				dots := strings.Split(message["fileName"], ".")
				fileName = "/" + uuid.New().String() + "." + dots[len(dots)-1]

				filePath := PubAssetsPath + "/chat" + fileName
				if err := os.WriteFile(filePath, bytes, 0777); err != nil {
					log.Println("chatHandler: Could not write file to", fileName)
					return
				}

				message["content"] = "/assets/chat" + fileName

				file, err := os.Stat(filePath)
				if err != nil {
					log.Println("chatHandler: Could not os.Stat " + path)
				}
				message["fileSize"] = fileSize(file.Size())
			}

			// Marshal *after* changing username
			marshalledMessage, err := json.Marshal(message)
			if err != nil {
				log.Println("Error:", err)
				return
			}

			delete(message, "type")
			obj = append(obj, message)

			saveObj, err := json.MarshalIndent(obj, "", "\t")
			os.WriteFile(AssetsPath+"/chat.json", saveObj, 0777)

			for client := range c.manager.Clients {
				if err := client.connection.WriteMessage(websocket.TextMessage, marshalledMessage); err != nil {
					log.Println("Failed to send message:", err)
				}
			}
		case "chatFetchAll":
			minified := &bytes.Buffer{}
			if err := json.Compact(minified, getChat()); err != nil {
				log.Println("Failed to minify chatBin:", err)
			}
			if err := c.connection.WriteMessage(websocket.TextMessage, minified.Bytes()); err != nil {
				log.Println("Failed to send message:", err)
			}
		}
	}

	// clean up connection
	c.manager.removeClient(c)
}

func HandlePingsMe(w http.ResponseWriter, r *http.Request) {
	body := parseBody[map[string]string](r).(map[string]string)
	if body["username"] == ValidateUser(body["uuid"]) {
		w.Write([]byte("true"))
	} else {
		w.Write([]byte("false"))
	}
}

func HandleGetSiteMetadata(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")

	res, err := http.Get(url)
	if err != nil {
		log.Printf("HandleGetSiteMetadata: failed to http.Get %s: %s\n", url, err.Error())

		ret, err := json.Marshal(map[string]string{
			"title":       url,
			"description": url,
			"image":       url,
		})
		if err != nil {
			log.Println("HandleGetSiteMetadata: failed to marshal JSON")
			_, err = w.Write([]byte("__error"))
		}
		_, err = w.Write(ret)
		if err != nil {
			log.Println("HandleGetSiteMetadata: failed to marshal write to ResponseWriter")
			return
		}
		return
	}
	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		log.Println("HandleGetSiteMetadata: failed to parse response body")
	}

	title := doc.Find("head title").Text()

	description := doc.Find("head meta[name='description']").AttrOr("content",
		doc.Find("head meta[property='og:description']").AttrOr("content",
			doc.Find("head meta[name='hostname']").AttrOr("content",
				title,
			),
		),
	)

	image := doc.Find("head meta[property='og:image']").AttrOr("content",
		fmt.Sprintf("/icon?url=%s&size=128", url),
	)

	ret, err := json.Marshal(map[string]string{
		"title":       title,
		"description": description,
		"image":       image,
	})
	if err != nil {
		log.Println("HandleGetSiteMetadata: failed to marshal JSON")
		return
	}
	_, err = w.Write(ret)
	if err != nil {
		log.Println("HandleGetSiteMetadata: failed to marshal write to ResponseWriter")
		return
	}
}
