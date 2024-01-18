package server

import (
	"net/http"
	"strings"
	"encoding/json"
	"os"
	"log"
)

func HandlePFP(w http.ResponseWriter, r *http.Request) {
	readBodyBytes := ReadBody(r)
	username := ValidateUser(string(readBodyBytes))

	path := PUBLIC + "/assets/users/" + username + ".png"

	if !fileExists(path) {
		path = PUBLIC + "/assets/users/__default.png"
	}

	w.Write([]byte(strings.ReplaceAll(path, PUBLIC, "")))
}

func HandleLogout(w http.ResponseWriter, r *http.Request) {
	readBodyBytes := ReadBody(r)
	username := ValidateUser(string(readBodyBytes)); if username != "?userinvalid" {
		log.Println("HandleLogout: User invalid!")
		w.Write([]byte("?userinvalid"))
	}

	usersMap := parseUsersJSON()

	whitelist := usersMap[username]["whitelist"].(map[string]interface{})
	delete(whitelist, string(readBodyBytes))

	if marshaledMap, err := json.MarshalIndent(usersMap, "", "\t"); err == nil {
		os.WriteFile(AssetsPath + "/users.json", marshaledMap, 0777)
		w.Write([]byte("ok"))
	} else {
		log.Println("Failed to marshal users map:", err)
		w.Write([]byte("fail"))
	}
}

