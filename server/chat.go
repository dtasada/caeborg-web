package server

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)


var	websocketUpgrader = websocket.Upgrader {
	ReadBufferSize: 1024,
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

	client := &Client {
		connection: conn,
		manager: m,
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
type ClientList map[*Client]bool

type Client struct {
	connection *websocket.Conn
	manager *Manager

	// avoid concurrent writes on websocket connection
	egress chan []byte
}

func NewClient(conn *websocket.Conn, manager *Manager) *Client {
	return &Client {
		connection: conn,
		manager: manager,
	}
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

		path := AssetsPath + "/chat.json"
		chatBin, err := os.ReadFile(path); if err != nil {
			log.Println("Error reading chat.json:", err)
		}

		switch message["type"] {
		case "chatPostMessage":
			var obj map[string]interface{}
			err = json.Unmarshal(chatBin, &obj); if err != nil {
				log.Println("Error:", err)
				return
			}

			username := ValidateUser(message["sender"]); if username != "?userinvalid" {
				message["sender"] = username
			} else {
				log.Println("Failed to validate user")
				return
			}

			if message["dataType"] == "img" {
				imgType := message["content"][strings.Index(message["content"], "/") + 1 : strings.Index(message["content"], ";")]
				fileName := fmt.Sprintf("/assets/chat/%s.%s", uuid.New().String(), imgType)

				message["content"] = strings.Split(message["content"], ";base64,")[1]

				imgBin, err := base64.StdEncoding.DecodeString(message["content"]); if err != nil {
					log.Println("Could not decode image base64 to bytes:", err)
				}

				if err := os.WriteFile(PUBLIC + fileName, imgBin, 0777); err != nil {
					log.Println("Could not write image to", PUBLIC + fileName)
					return
				}

				message["content"] = fileName
			}

			// Marshal *after* changing username
			marshalledMessage, err := json.Marshal(message); if err != nil {
				log.Println("Error:", err)
				return
			}

			delete(message, "type")
			obj[fmt.Sprintf("%d", len(obj))] = message

			saveObj, err := json.MarshalIndent(obj, "", "\t")
			os.WriteFile(path, saveObj, 0777)

			for client := range c.manager.Clients {
				if err := client.connection.WriteMessage(websocket.TextMessage, marshalledMessage); err != nil {
					log.Println("Failed to send message:", err)
				}
			}
		case "chatFetchAll":
			minified := &bytes.Buffer{}
			if err := json.Compact(minified, chatBin); err != nil {
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
