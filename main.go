package main

import (
	"bufio"
	"crypto/tls"
	"fmt"
	"golang.org/x/net/websocket"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	// "strings"
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

	besticon := exec.Command("./server/besticon/besticon_" + machineType, ">", "/dev/null")
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


var tlsConfig = &tls.Config{}
func setTLS() {
	tlsConfig.Certificates = make([]tls.Certificate, 1)
	cert, err := tls.LoadX509KeyPair("/etc/letsencrypt/live/caeborg.dev/fullchain.pem", "/etc/letsencrypt/live/caeborg.dev/privkey.pem")
	if err != nil {
		log.Fatal(err)
	}
	tlsConfig.Certificates[0] = cert
}

var domain = "caeborg.dev"
var PATH, PUBLIC string
var devMode = false
var ipAddr string
func startServer() {
	const PORT = 8000
	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.Dir(PUBLIC)))
	// mux.Handle("/.well-known/acme-challenge/", http.FileServer(http.Dir("/letsencrypt")))

	mux.HandleFunc("/icon", func (w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, fmt.Sprintf("http://%s:8080%s", ipAddr, r.URL), http.StatusSeeOther)
	})

	// mux.Handle("/chat", websocket.Handler(Sock))

	server := &http.Server{
		Addr:	fmt.Sprintf(":%d", PORT),
		Handler:	mux,
		TLSConfig: tlsConfig,
	}

	// http.HandleFunc("/chatThings", wsEndpoint)

	// mux.ListenAndServe(fmt.Sprintf(":%d", PORT), nil)
	err := server.ListenAndServeTLS("", "")
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	PATH, _ = os.Getwd()
	PUBLIC = PATH + "/client/public"
	args := os.Args[1:]

	if len(args) != 0 {
		if args[0] == "dev" {
			devMode = true
			go sassFunc()
		}
	}

	fmt.Printf("At '%s':\n", domain)

	ips, _ := net.LookupIP(domain)
	for _, ip := range ips {
		if ipv4 := ip.To4(); ipv4 != nil {
			ipAddr = fmt.Sprintf("%s", ipv4)
		}
	}

	setTLS()
	bestIcon()
	startServer()
}
