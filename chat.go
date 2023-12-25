package main

import (
	"encoding/json"
	"fmt"
	// "io/fs"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/websocket"
)

var	websocketUpgrader = websocket.Upgrader{
	ReadBufferSize: 1024,
	WriteBufferSize: 1024,
}

type Manager struct {
	clients ClientList
	sync.RWMutex
}

func (m *Manager) serveChat(w http.ResponseWriter, r *http.Request) {
	fmt.Println("new connection")

	// upgrade regular http connection to websocket
	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// client := NewClient(conn, m)
	client := &Client{
		connection: conn,
		manager: m,
	}

	m.addClient(client)

	// start goroutines
	go client.chatHandler()
}

func (m *Manager) addClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	m.clients[client] = true
}

func (m *Manager) removeClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	if _, ok := m.clients[client]; ok {
		client.connection.Close()
		delete(m.clients, client)
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
	return &Client{
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
		fmt.Println("message:", message)

		switch message["type"] {
		case "chatPostMessage":
			path := PATH + "/server/assets/chat.json"
			chatBin, err := os.ReadFile(path);					if err != nil { log.Println("Error reading chat.json:", err) }

			var obj map[string]interface{}
			err = json.Unmarshal(chatBin, &obj);				if err != nil { log.Println("Error:", err) }

			marshalledMessage, err := json.Marshal(message);	if err != nil { log.Println("Error:", err) }

			delete(message, "type")
			obj[fmt.Sprintf("%d", len(obj))] = message

			saveObj, err := json.Marshal(obj)
			os.WriteFile(path, saveObj, 0777)

			for client := range c.manager.clients {
				if err := client.connection.WriteMessage(websocket.TextMessage, marshalledMessage); err != nil {
					log.Println("Failed to send message:", err)
				}
			}
		case "chatFetchAll":
			path := PATH + "/server/assets/chat.json"
			chatBin, err := os.ReadFile(path);			if err != nil { log.Println("Error reading chat.json:", err) }
			if err := c.connection.WriteMessage(websocket.TextMessage, chatBin); err != nil {
				log.Println("Failed to send message:", err)
			}
		}
	}

	// clean up connection
	c.manager.removeClient(c)
}
