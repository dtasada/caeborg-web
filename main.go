package main

import (
	"bufio"
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
)

func sassFunc() {
	sass := exec.Command("sass", "--watch", "./client/public/styles:./client/public/.css")
	sass.Env = append(sass.Env, os.Environ()...)

	stdout, _ := sass.StdoutPipe()

	sass.Start()
	fmt.Println("Started sass compiler")

	reader := bufio.NewReader(stdout)

	for {
		output, _ := reader.ReadString('\n')
		fmt.Print(output)
	}
}

func bestIcon() {
	machineType := runtime.GOOS + "_" + runtime.GOARCH

	besticon := exec.Command(fmt.Sprintf("./server/besticon/besticon_%s", machineType), ">", "/dev/null")
	besticon.Env = append(os.Environ(), "PORT=8080", "DISABLE_BROWSE_PAGES=true")
	besticon.Start()
}

var upgrader = websocket.Upgrader {
	ReadBufferSize: 1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool { return true } ,
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	log.Println("Client Connected")

	err = ws.WriteMessage(1, []byte("Hi Client!"))
	if err != nil {
		log.Println(err)
	}

	for {
		messageType, p, err := ws.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}

		log.Println(string(p))

		if err := ws.WriteMessage(messageType, p); err != nil {
			log.Println(err)
			return
		}
	}
}

func main() {
	PATH, _ := os.Getwd()
	PUBLIC := fmt.Sprintf("%s/client/public", PATH)

	args := os.Args[1:]
	const PORT = 8000

	if len(os.Args[1:]) != 0 {
		if args[0] == "dev" {
			go sassFunc()
		}
	}

	customUrl := "https://caeborg.dev"
	for _, arg := range args {
		if strings.Contains(arg, "--url") {
			customUrl = strings.Split(arg, "=")[1]
		}
	}

	fmt.Printf("At '%s':\n", customUrl)

	http.Handle("/", http.FileServer(http.Dir(PUBLIC)))

	http.HandleFunc("/icons*", func (w http.ResponseWriter, r *http.Request) {
		url := strings.Split(r.URL.Path, "/icons/")[1]
		http.Redirect(w, r, fmt.Sprintf("%s:8080/icon?%s", customUrl, url), http.StatusSeeOther)
	})

	http.HandleFunc("/chatThings", wsEndpoint)

	bestIcon()

	log.Fatal(http.ListenAndServe(":8000", nil))
}
