package main

import (
	"bufio"
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"

	"github.com/dtasada/caeborg-web/server"
)

func compileSelf() {
	steps := []string {
		"windows_amd64",
		"darwin_amd64",
		"darwin_arm64",
		"linux_amd64",
		"linux_arm64",
	}

	for _, pair := range steps {
		goos := strings.Split(pair, "_")[0]
		goarch := strings.Split(pair, "_")[1]

		comp := exec.Command("env", "GOOS=" + goos, "GOARCH=" + goarch, "go", "build", "-o", "./releases/caeborg_" + pair)

		_, err := comp.Output();
		if err != nil {
			log.Println("Error compiling new packages:", err)
			return
		}
	}

	log.Println("New packages compiled")
}

func startSass() {
	var shouldWatch string
	if server.DevMode { shouldWatch = "--watch" }
	
	sass := exec.Command("sass", shouldWatch, "./client/public/styles:./client/public/.css")
	sass.Env = append(sass.Env, os.Environ()...)


	if server.DevMode {
		stdout, _ := sass.StdoutPipe()
		sass.Start()
		log.Println("Started sass compiler")

		reader := bufio.NewReader(stdout)

		for {
			output, _ := reader.ReadString('\n')
			log.Print("sass -", output)
		}
	} else {
		sass.Run()
		log.Println("Compiled sass files.")
	}
}

func bestIcon() {
	machineType := runtime.GOOS + "_" + runtime.GOARCH

	besticon := exec.Command("./server/besticon/besticon_" + machineType, ">", "/dev/null")
	besticon.Env = append(os.Environ(), "PORT=8080", "DISABLE_BROWSE_PAGES=true")

	err := besticon.Start()
	if err != nil {
		log.Println("Error running bestIcon:", err)
	}
}

func setTLS() {
	server.TlsConfig.Certificates = make([]tls.Certificate, 1)
	cert, err := tls.LoadX509KeyPair(server.AssetsPath + "/credentials/fullchain.pem", server.AssetsPath + "/credentials/privkey.pem")
	if err != nil {
		log.Fatal(err)
	}
	server.TlsConfig.Certificates[0] = cert
}

func startServer() {
	const PORT = 8000
	mux := http.NewServeMux()

	// Home
	// mux.HandleFunc("/", func (w http.ResponseWriter, r *http.Request) {
	// 	url := strings.Split(fmt.Sprintf("%v", r.URL), "/")[1]
	//
	// 	if strings.Contains(url, "?frame=") {
	// 		// file, err := os.ReadDir(server.PUBLIC + "/pages"); if err != nil { log.Println("Error reading file system:", err) }
	// 		// http.Redirect(w, r, fmt.Sprintf("%s/pages/%s.html", server.PUBLIC, url), http.StatusPermanentRedirect)
	// 	} else {
	// 		server := http.FileServer(http.Dir(server.PUBLIC))
	// 		http.StripPrefix("/", server).ServeHTTP(w, r)
	// 	}
	// })
	mux.Handle("/", http.FileServer(http.Dir(server.PUBLIC)))

	mux.HandleFunc("/login", server.HandleLogin)
	mux.HandleFunc("/auth", server.HandleAuth)
	mux.HandleFunc("/validate", server.HandleValidation)

	// Icons
	mux.HandleFunc("/icon", func (w http.ResponseWriter, r *http.Request) {
		url := fmt.Sprintf("http://%s:8080%s", server.IpAddr, r.URL)

		res, err := http.Get(url);					if err != nil { log.Println("Error serving image:", err) }
		imgBytes, err := io.ReadAll(res.Body);		if err != nil { log.Println("Error serving image:", err) }
		res.Body.Close()

		w.Header().Add("cache-control", "max-age=21600")
		w.Write(imgBytes)
	})

	// Chat
	manager := server.Manager {
		Clients: make(server.ClientList),
	}

	mux.HandleFunc("/chat", manager.ServeChat)

	// Server
	srv := &http.Server {
		Addr:		fmt.Sprintf(":%d", PORT),
		Handler:	mux,
		TLSConfig:	server.TlsConfig,
	}

	err := srv.ListenAndServeTLS("", "")
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	if server.DevMode {
		ips, _ := net.LookupIP(server.Domain)
		for _, ip := range ips {
			if ipv4 := ip.To4(); ipv4 != nil {
				server.IpAddr = fmt.Sprintf("%s", ipv4)
			}
		}

		go compileSelf()
	}

	go startSass()

	log.Printf("At '%s':\n", server.Domain)

	bestIcon()
	setTLS()
	startServer()
}
