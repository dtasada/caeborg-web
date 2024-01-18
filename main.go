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
	"slices"

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

		comp := exec.Command("env", "GOOS=" + goos, "GOARCH=" + goarch, "go", "build", "-o", "~/.local/bin/caeborg_" + pair)

		_, err := comp.Output();
		if err != nil {
			log.Println("Error compiling new packages:", err)
			return
		}
	}

	log.Println("New packages compiled")
}

func startSass() {
	var sass *exec.Cmd
	if server.DevMode {
		sass = exec.Command("sass", "--watch", "./client/public/styles:./client/public/.css")
		sass.Env = append(sass.Env, os.Environ()...)
		stdout, _ := sass.StdoutPipe()
		sass.Start()
		log.Println("Started sass compiler")

		reader := bufio.NewReader(stdout)

		for {
			output, _ := reader.ReadString('\n')
			log.Print("sass -", output)
		}
	} else {
		sass = exec.Command("sass", "./client/public/styles:./client/public/.css")
		sass.Env = append(sass.Env, os.Environ()...)
		if err := sass.Run(); err != nil {
			log.Println("Could not compile sass")
		} else {
			log.Println("Compiled sass files.")
		}
		return
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
	mux.Handle("/", http.FileServer(http.Dir(server.PUBLIC)))

	if pagesFolder, err := os.ReadDir(server.PUBLIC + "/pages"); err == nil {
		for _, file := range pagesFolder {
			urlName := strings.ReplaceAll("/" + file.Name(), ".html", "")
			mux.HandleFunc(urlName, server.ServeFile)
		}
	} else {
		log.Fatalln("Could not read", server.PUBLIC + "/pages:", err)
	}

	// login.go
	mux.HandleFunc("/auth", server.HandleAuth)
	mux.HandleFunc("/logout", server.HandleLogout)
	mux.HandleFunc("/validate", server.HandleValidation)
	mux.HandleFunc("/fetchPFP", server.HandlePFP)
	// /login and /account are already indexed


	// launcher.go
	mux.HandleFunc("/fetchLauncher", server.HandleFetchLauncher)
	mux.HandleFunc("/postLauncher", server.HandlePostLauncher)

	// chat.go
	manager := server.Manager {
		Clients: make(server.ClientList),
	}

	mux.HandleFunc("/chatSocket", manager.ServeChat)

	// Icons
	mux.HandleFunc("/icon", func (w http.ResponseWriter, r *http.Request) {
		url := fmt.Sprintf("http://%s:8080%s", server.IpAddr, r.URL)

		res, err := http.Get(url);					if err != nil { log.Println("Error serving image:", err) }
		imgBytes, err := io.ReadAll(res.Body);		if err != nil { log.Println("Error serving image:", err) }
		res.Body.Close()

		w.Header().Add("cache-control", "max-age=21600")
		w.Write(imgBytes)
	})

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

		if slices.Contains(server.Args, "--release") {
			go compileSelf()
		}
	}

	go startSass()

	log.Printf("At '%s':\n", server.Domain)

	bestIcon()
	setTLS()
	startServer()
}
