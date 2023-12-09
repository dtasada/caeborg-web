package main

import (
	"bufio"
	"fmt"
	"golang.org/x/net/websocket"
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

	besticon := exec.Command("./server/besticon/besticon_%s" + machineType, ">", "/dev/null")
	besticon.Env = append(os.Environ(), "PORT=8080", "DISABLE_BROWSE_PAGES=true")
	besticon.Start()
}

func Sock(ws *websocket.Conn) {
	for {
		var reply string

		if err := websocket.Message.Receive(ws, &reply); err != nil {
			fmt.Println("Can't receive")
			break
		}

		fmt.Println("Received back from client: " + reply)

		msg := "Received: " + reply
		fmt.Println("Sending to client: " + msg)

		if err := websocket.Message.Send(ws, msg); err != nil {
			fmt.Println("Can't send")
			break
		}
	}
}

func main() {
	PATH, _ := os.Getwd()
	PUBLIC := PATH + "/client/public"

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

	// http.HandleFunc("/chatThings", wsEndpoint)

	http.Handle("/chat", websocket.Handler(Sock))

	bestIcon()

	http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil)
}
