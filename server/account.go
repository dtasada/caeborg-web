package server

import (
	"net/http"
	"strings"
	"encoding/json"
	"encoding/base64"
	"os"
	"log"
	"fmt"
)

func HandlePFP(w http.ResponseWriter, r *http.Request) {
	readBodyBytes := ReadBody(r)
	username := ValidateUser(string(readBodyBytes))

	path := PUBLIC + "/assets/users/" + username + ".png"

	if fileExists(path) {
		w.Write([]byte(strings.ReplaceAll(path, PUBLIC, "")))
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

	imgType := message["content"][strings.Index(message["content"], "/") + 1 : strings.Index(message["content"], ";")]
	fileName := fmt.Sprintf("/assets/users/%s.%s", username, imgType)

	message["content"] = strings.Split(message["content"], ";base64,")[1]

	imgBin, err := base64.StdEncoding.DecodeString(message["content"]); if err != nil {
		log.Println("Could not decode image base64 to bytes:", err)
	}

	if err := os.WriteFile(PUBLIC + fileName, imgBin, 0777); err != nil {
		log.Println("Could not write image to", PUBLIC + fileName)
		return
	}
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

