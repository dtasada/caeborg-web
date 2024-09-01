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
	"slices"
	"strings"

	"github.com/dtasada/caeborg-web/server"
)

func compileSelf() {
	targets := []string{
		"windows_amd64.exe",
		"darwin_amd64",
		"darwin_arm64",
		"linux_amd64",
		"linux_arm64",
	}

	for _, target := range targets {
		goos := strings.Split(target, "_")[0]
		goarch := strings.Split(target, "_")[1]

		comp := exec.Command("env", "GOOS="+goos, "GOARCH="+goarch, "go", "build", "-o", "~/.local/bin/caeborg_"+target)

		_, err := comp.Output()
		if err != nil {
			log.Println("Error compiling new packages:", err)
			return
		}
	}

	log.Println("New packages compiled")
}

func compileTS() {
	var tsc *exec.Cmd
	tsc = exec.Command("tsc-watch", "--noClear")
	if server.DevMode {
		tsc.Env = append(tsc.Env, os.Environ()...)
		stdout, _ := tsc.StdoutPipe()
		if err := tsc.Start(); err != nil {
			fmt.Println("Couldn't run tsc-watch. Make sure it's installed.")
			fmt.Println("Consider running `npm install -g tsc-watch`")
			os.Exit(1)
		}

		log.Println("Started tsc-watch")
		reader := bufio.NewReader(stdout)

		for {
			if output, _ := reader.ReadString('\n'); output != "\n" {
				log.Print("tsc-watch - ", output)
			}
		}
	} else {
		tsc.Env = append(tsc.Env, os.Environ()...)
		if err := tsc.Run(); err != nil {
			log.Println("Could not compile typescript")
		} else {
			log.Println("Compiled typescript")
		}
		return
	}
}

func compileSass() {
	var sass *exec.Cmd
	if server.DevMode {
		sass = exec.Command("sass", "--watch", "./preproc/styles:./client/public/.css")
		sass.Env = append(sass.Env, os.Environ()...)
		stdout, _ := sass.StdoutPipe()
		sass.Start()
		log.Println("Started sass compiler")

		reader := bufio.NewReader(stdout)

		for {
			if output, _ := reader.ReadString('\n'); output != "\n" {
				log.Print("sass - ", output)
			}
		}
	} else {
		sass = exec.Command("sass", "./preproc/styles:./client/public/.css")
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

	besticon := exec.Command("./server/besticon/besticon_"+machineType, ">", "/dev/null")
	besticon.Env = append(os.Environ(), "PORT=8080", "DISABLE_BROWSE_PAGES=true")

	err := besticon.Start()
	if err != nil {
		log.Println("Error running bestIcon:", err)
	}
}

func setTLS() {
	server.TlsConfig.Certificates = make([]tls.Certificate, 1)
	cert, err := tls.LoadX509KeyPair(server.AssetsPath+"/credentials/fullchain.pem", server.AssetsPath+"/credentials/privkey.pem")
	if err != nil {
		log.Fatal(err)
	}
	server.TlsConfig.Certificates[0] = cert
}

func startServer() {
	const PORT = 8000
	mux := http.NewServeMux()

	// Home
	mux.Handle("/", http.FileServer(http.Dir(server.PublicPath)))

	if pagesFolder, err := os.ReadDir(server.PublicPath + "/pages"); err == nil {
		for _, file := range pagesFolder {
			urlName := strings.ReplaceAll("/"+file.Name(), ".html", "")
			mux.HandleFunc(urlName, server.ServeFile)
		}
	} else {
		log.Fatalln("Could not read", server.PublicPath+"/pages:", err)
	}

	// login.go
	mux.HandleFunc("/auth", server.HandleAuth)
	mux.HandleFunc("/logout", server.HandleLogout)
	mux.HandleFunc("/logoutAll", server.HandleLogoutAll)
	mux.HandleFunc("/validate", server.HandleValidation)
	mux.HandleFunc("/getPFP", server.HandleGetPFP)
	mux.HandleFunc("/getUserSettings", server.HandleGetUserSettings)
	mux.HandleFunc("/changeUserSettings", server.HandleChangeUserSettings)
	mux.HandleFunc("/changePFP", server.HandleChangePFP)
	mux.HandleFunc("/changeUsername", server.HandleChangeUsername)
	mux.HandleFunc("/changePassword", server.HandleChangePassword)
	// /login and /account are already indexed

	// launcher.go
	mux.HandleFunc("/getLauncher", server.HandleGetLauncher)
	mux.HandleFunc("/postLauncher", server.HandlePostLauncher)

	// chat.go
	manager := server.Manager{Clients: make(server.ClientList)}
	mux.HandleFunc("/chatSocket", manager.ServeChat)
	mux.HandleFunc("/pingUser", server.HandleChatPingsMe)
	mux.HandleFunc("/siteMetadata", server.HandleGetLinkPreviewMetadata)

	// misc

	// Icons
	mux.HandleFunc("/icon", func(w http.ResponseWriter, r *http.Request) {
		res, err := http.Get(fmt.Sprintf("http://%s:8080%s", server.IpAddr, r.URL))
		if err != nil {
			log.Println("Error serving image:", err)
		}
		imgBytes, err := io.ReadAll(res.Body)
		if err != nil {
			log.Println("Error serving image:", err)
		}
		res.Body.Close()

		w.Header().Add("cache-control", "max-age=3600,public,proxy-revalidate")
		w.Write(imgBytes)
	})

	// Server
	srv := &http.Server{
		Addr:      fmt.Sprintf(":%d", PORT),
		Handler:   mux,
		TLSConfig: server.TlsConfig,
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

	go compileSass()
	go compileTS()

	log.Printf("At '%s':\n", server.Domain)

	bestIcon()
	setTLS()
	startServer()
}
