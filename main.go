package main

import (
	"bufio"
	"crypto/tls"
	"fmt"
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

// Init variables
var (
	tlsConfig = &tls.Config{}
	domain = "caeborg.dev"
	PATH, PUBLIC string
	devMode = false
	ipAddr string
)

func setTLS() {
	tlsConfig.Certificates = make([]tls.Certificate, 1)
	var path [2]string
	if devMode {
		path = [2]string{"./cert.pem", "./key.pem"}
	} else {
		path = [2]string{"/etc/letsencrypt/live/caeborg.dev/fullchain.pem", "/etc/letsencrypt/live/caeborg.dev/privkey.pem"}
	}
	cert, err := tls.LoadX509KeyPair(path[0], path[1])
	if err != nil {
		log.Fatal(err)
	}
	tlsConfig.Certificates[0] = cert
}

func startServer() {
	const PORT = 8000
	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir(PUBLIC)))

	mux.HandleFunc("/icon", func (w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, fmt.Sprintf("http://%s:8080%s", ipAddr, r.URL), http.StatusSeeOther)
	})

	manager := Manager{
		clients: make(ClientList),
	}

	mux.HandleFunc("/chat", manager.serveChat)

	server := &http.Server{
		Addr:	fmt.Sprintf(":%d", PORT),
		Handler:	mux,
		TLSConfig: tlsConfig,
	}

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
			ipAddr = "localhost"
			domain = "localhost"
			go sassFunc()
		}
	} else {
		ips, _ := net.LookupIP(domain)
		for _, ip := range ips {
			if ipv4 := ip.To4(); ipv4 != nil {
				ipAddr = fmt.Sprintf("%s", ipv4)
			}
		}
	}

	fmt.Printf("At '%s':\n", domain)

	setTLS()
	startServer()
	bestIcon()
}
