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
	sass := exec.Command("sass", "--watch", "./client/public/styles:./client/public/.css")
	sass.Env = append(sass.Env, os.Environ()...)

	stdout, _ := sass.StdoutPipe()

	sass.Start()
	log.Println("Started sass compiler")

	reader := bufio.NewReader(stdout)

	for {
		output, _ := reader.ReadString('\n')
		log.Print(output)
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
	var path [2]string
	if server.DevMode {
		path = [2]string {"./credentials/fullchain.pem", "./credentials/privkey.pem"}
	} else {
		// path = [2]string {"/etc/letsencrypt/live/caeborg.dev/fullchain.pem", "/etc/letsencrypt/live/caeborg.dev/privkey.pem"}
		path = [2]string {"/var/www/caeborg_credentials/fullchain.pem", "/var/www/caeborg_credentials/privkey.pem"}
	}
	cert, err := tls.LoadX509KeyPair(path[0], path[1])
	if err != nil {
		log.Fatal(err)
	}
	server.TlsConfig.Certificates[0] = cert
}

func startServer() {
	const PORT = 8000
	mux := http.NewServeMux()

	// Home
	mux.HandleFunc("/", func (w http.ResponseWriter, r *http.Request) {
		url := strings.Split(fmt.Sprintf("%v", r.URL), "/")[1]

		if strings.Contains(url, "?frame=") {
			pages, err := os.ReadDir(server.PUBLIC + "/pages"); if err != nil { log.Println("Error reading file system:", err) }
			for _, file := range pages {
				http.Redirect(w, r, "/pages/" + file.Name() + url, http.StatusSeeOther)
			}
		} else {
			server := http.FileServer(http.Dir(server.PUBLIC))
			http.StripPrefix("/", server).ServeHTTP(w, r)
		}
	})

	// mux.HandleFunc("/login", server.HandleLogin)
	mux.HandleFunc("/login", func(r http.ResponseWriter, w *http.Request) {
		loginFile, err := os.ReadFile(server.PUBLIC + "/pages/login.html")
		if err != nil { log.Println("Couldn't read login.html")}
		r.Write(loginFile)
	})
	mux.HandleFunc("/auth", server.HandleAuth)

	// Icons
	mux.HandleFunc("/icon", func (w http.ResponseWriter, r *http.Request) {
		url := fmt.Sprintf("http://%s:8080%s", server.IpAddr, r.URL)

		res, err := http.Get(url);					if err != nil { log.Println("Error serving image:", err) }
		imgBytes, err := io.ReadAll(res.Body);	if err != nil { log.Println("Error serving image:", err) }
		res.Body.Close()

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
	server.PATH, _ = os.Getwd()
	server.PUBLIC = server.PATH + "/client/public"
	args := os.Args[1:]

	if len(args) == 0 {
		ips, _ := net.LookupIP(server.Domain)
		for _, ip := range ips {
			if ipv4 := ip.To4(); ipv4 != nil {
				server.IpAddr = fmt.Sprintf("%s", ipv4)
			}
		}
	} else {
		go compileSelf()
		go startSass()
	}

	log.Printf("At '%s':\n", server.Domain)

	bestIcon()
	setTLS()
	startServer()
}
