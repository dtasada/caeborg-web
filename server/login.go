package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

// func HandleLogin(r http.ResponseWriter, w *http.Request) {
// 	loginFile, err := os.ReadFile(PUBLIC + "/pages/login.html"); if err != nil { log.Println("Couldn't read login.html")}
// 	r.Write(loginFile)
// }

func HandleAuth(w http.ResponseWriter, r *http.Request) {
	var path string
	if DevMode {
		path = "./credentials/users.json"
	} else {
		path = "/var/www/caeborg_credentials/users.json"
	}
	usersFileBin, err := os.ReadFile(path); if err != nil { log.Printf("Could not access %s: %v\n", path, err) }

	var usersMap map[string]string
	err = json.Unmarshal(usersFileBin, &usersMap); if err != nil { log.Printf("Could not unmarshal %s: %v", path, err) }

	// fmt.Println("r:", r)
	fmt.Printf("r.Body: %v", r.Body)
}
