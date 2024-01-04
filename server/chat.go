package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"

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
		chatBin, err := os.ReadFile(path);	if err != nil { log.Println("Error reading chat.json:", err) }

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

			// Marshal *after* changing username
			marshalledMessage, err := json.Marshal(message); if err != nil {
				log.Println("Error:", err)
				return
			}

			delete(message, "type")
			obj[fmt.Sprintf("%d", len(obj))] = message

			saveObj, err := json.Marshal(obj)
			os.WriteFile(path, saveObj, 0777)

			for client := range c.manager.Clients {
				if err := client.connection.WriteMessage(websocket.TextMessage, marshalledMessage); err != nil {
					log.Println("Failed to send message:", err)
				}
			}
		case "chatFetchAll":
			if err := c.connection.WriteMessage(websocket.TextMessage, chatBin); err != nil {
				log.Println("Failed to send message:", err)
			}
		}
	}

	// clean up connection
	c.manager.removeClient(c)
}
