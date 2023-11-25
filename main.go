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
	if len(os.Args[1:]) == 0 {
		fmt.Println("Please enter a exec type: 'start'|'dev'")
		return
	}

	args := os.Args[1:]
	customUrl := "https://caeborg.dev"
	const PORT = 8000


	switch args[0] {
	case "start":
		fmt.Println("bun run server/server.js '@'") // this
	case "dev":
		fmt.Println("bun run --hot server/server.js --url=http://localhost '$@'") // this

		// exec.Command("sass --watch client/public/styles:client/public/.css")
		fmt.Println("Started sass compiler")
	default:
		fmt.Println("Please enter a exec type: 'start'|'dev'")
		return
	}

	for _, arg := range args {
		if strings.Contains(arg, "--url") {
			customUrl = strings.Split(arg, "=")[1]
		}
	}

	fmt.Printf("At '%s':\n", customUrl)

	PATH, _ := os.Getwd()
	PUBLIC := fmt.Sprintf("%s/client/public", PATH)

	http.Handle("/", http.FileServer(http.Dir(PUBLIC)))

	machineType := runtime.GOOS + "_" + runtime.GOARCH
	besticon := exec.Command(fmt.Sprintf("./server/besticon/besticon_%s", machineType), ">", "/dev/null")
	besticon.Env = append(os.Environ(), "PORT=8080", "DISABLE_BROWSE_PAGES=true")
	go besticon.Run()

	log.Fatal(http.ListenAndServe(":8000", nil))
}
