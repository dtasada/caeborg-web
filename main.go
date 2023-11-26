package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
)

func main() {

	PATH, _ := os.Getwd()
	PUBLIC := fmt.Sprintf("%s/client/public", PATH)

	args := os.Args[1:]
	customUrl := "https://caeborg.dev"
	const PORT = 8000

	machineType := runtime.GOOS + "_" + runtime.GOARCH

	if len(os.Args[1:]) != 0 { switch args[0] {
		case "dev":
			sass := exec.Command("sass", "--watch", "./client/public/styles:./client/public/.css")
			sass.Env = append(sass.Env, os.Environ()...)
			go sass.Run()
			fmt.Println("Started sass compiler")
		}
	}

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

	besticon := exec.Command(fmt.Sprintf("./server/besticon/besticon_%s", machineType), ">", "/dev/null")
	besticon.Env = append(os.Environ(), "PORT=8080", "DISABLE_BROWSE_PAGES=true")
	go besticon.Run()

	log.Fatal(http.ListenAndServe(":8000", nil))
}
