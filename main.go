package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"github.com/bep/godartsass"
)

func iterate(folder []os.DirEntry, transpiler godartsass.Transpiler) {
	PATH, _ := os.Getwd()

	for _, file := range folder {
		filePath := fmt.Sprintf("%s/client/public/styles/%s", PATH, file.Name())
		strFile, _ := os.ReadFile(filePath)
		res, _ := transpiler.Execute(godartsass.Args {
			Source: string(strFile),
			OutputStyle: godartsass.OutputStyleCompressed,
			SourceSyntax: godartsass.SourceSyntaxCSS,
			URL: fmt.Sprintf("file://%s/client/public/styles", PATH),
		})
		fmt.Println(res)
	}
}

func main() {

	PATH, _ := os.Getwd()
	PUBLIC := fmt.Sprintf("%s/client/public", PATH)

	args := os.Args[1:]
	customUrl := "https://caeborg.dev"
	const PORT = 8000

	machineType := runtime.GOOS + "_" + runtime.GOARCH

	transpiler, _ := godartsass.Start(godartsass.Options {
		DartSassEmbeddedFilename: fmt.Sprintf("./server/dart-sass-embedded/sass_embedded_%s/dart-sass-embedded", machineType),
	})

	sassRoot, _ := os.ReadDir(fmt.Sprintf("%s/client/public/styles", PATH))
	for _, item := range sassRoot {
		if item.IsDir() {
			folder, _ := os.ReadDir(fmt.Sprintf("%s/client/public/styles/%s", PATH, item.Name()))
		} else {
			iterate(item, transpiler)
		}
	}

	if len(os.Args[1:]) != 0 { switch args[0] {
		case "dev":
			sass := exec.Command("sass --watch ./client/public/styles:./client/public/.css")
			sass.Env = os.Environ()
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
