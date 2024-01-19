package server

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
)

func HandlePFP(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("uuid"); if username != "" {
		username = ValidateUser(username)
	} else {
		username = r.URL.Query().Get("username")
	}

	path := "/assets/users/" + username + ".avif"

	w.Header().Add("cache-control", "max-age=3600")
	if fileExists(PUBLIC + path) {
		w.Write([]byte(path))
	} else {
		w.Write([]byte(fmt.Sprintf("/icon?url=%s&size=64..128..256", username)))
	}
}

func HandleNewPFP(w http.ResponseWriter, r *http.Request) {
	readBodyBytes := ReadBody(r)

	var message map[string]string
	if err := json.Unmarshal(readBodyBytes, &message); err != nil {
		log.Println("Error parsing JSON: ", err)
		return
	}

	username := ValidateUser(message["uuid"])

	fileName := fmt.Sprintf(PUBLIC + "/assets/users/%s.avif", username)

	message["content"] = strings.Split(message["content"], ";base64,")[1]

	imgBin, err := base64.StdEncoding.DecodeString(message["content"]); if err != nil {
		log.Println("Could not decode image base64 to bytes:", err)
	}

	if err := os.WriteFile(fileName, imgBin, 0777); err != nil {
		log.Println("Could not write image to", PUBLIC + fileName)
		return
	}

	toAVIF(fileName)
}

func HandleLogout(w http.ResponseWriter, r *http.Request) {
	readBodyBytes := ReadBody(r)
	w.Header().Add("cache-control", "max-age=3600")
	username := ValidateUser(string(readBodyBytes)); if username == "?userinvalid" {
		log.Println("HandleLogout: User invalid!")
		w.Write([]byte("?userinvalid"))
		return
	}

	usersMap := parseUsersJSON()

	whitelist := usersMap[username]["whitelist"].(map[string]interface{})
	delete(whitelist, string(readBodyBytes))

	w.Header().Add("cache-control", "max-age=3600")
	if marshaledMap, err := json.MarshalIndent(usersMap, "", "\t"); err == nil {
		os.WriteFile(AssetsPath + "/users.json", marshaledMap, 0777)
		w.Write([]byte("ok"))
	} else {
		log.Println("Failed to marshal users map:", err)
		w.Write([]byte("fail"))
	}
}
