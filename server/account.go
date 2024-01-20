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
	if fileExists(PublicPath + path) {
		w.Write([]byte(path))
	} else {
		w.Write([]byte(fmt.Sprintf("/icon?url=%s&size=64..128..256", username)))
	}
}

func HandleChangePFP(w http.ResponseWriter, r *http.Request) {
	body := parseBody[map[string]string](r).(map[string]string)

	username := ValidateUser(body["uuid"])

	fileName := fmt.Sprintf(PubAssetsPath + "/users/%s.avif", username)

	body["content"] = strings.Split(body["content"], ";base64,")[1]

	imgBin, err := base64.StdEncoding.DecodeString(body["content"]); if err != nil {
		log.Println("Could not decode image base64 to bytes:", err)
	}

	if err := os.WriteFile(fileName, imgBin, 0777); err != nil {
		log.Println("HandleChangePFP: Could not write image to", fileName)
		return
	}

	toAVIF(fileName)
}

func HandleChangeUsername(w http.ResponseWriter, r *http.Request) {
	body := parseBody[map[string]string](r).(map[string]string)

	username := ValidateUser(body["uuid"])
	usersMap := parseUsersJSON()

	if _, userExists := usersMap[body["target"]]; userExists {
		log.Printf("User %s tried to change username, but user %s already exists!", username, body["target"])
		w.Write([]byte("__userExists"))
		return
	}
	usersMap[body["target"]] = usersMap[username]
	delete(usersMap, username)
	marshaledUsersMap, err := json.MarshalIndent(usersMap, "", "\t"); if err != nil {
		log.Println("HandleChangeUsername: Failed to marshal users map:", err)
		return
	}
	os.WriteFile(AssetsPath + "/users.json", marshaledUsersMap, 0777)

	oldPFP := fmt.Sprintf("%s/assets/users/%s.avif", PublicPath, username)
	os.Rename(oldPFP, strings.Replace(oldPFP, username, body["target"], 1))

	chatJSONPath := AssetsPath + "/chat.json"
	chatJSON, err := os.ReadFile(chatJSONPath); if err != nil {
		log.Println("HandleChangeUsername: Could not read", chatJSONPath + ":", err)
	}
	newChatJSON := strings.ReplaceAll(string(chatJSON), fmt.Sprintf(`"sender": "%s"`, username), fmt.Sprintf(`"sender": "%s"`, body["target"]))
	os.WriteFile(chatJSONPath, []byte(newChatJSON), 0777)

	log.Printf("Changed %s's username to %s!", username, body["target"])
}

func HandleChangePassword(w http.ResponseWriter, r *http.Request) {
	body := parseBody[map[string]string](r).(map[string]string)

	username := ValidateUser(body["uuid"])
	usersMap := parseUsersJSON()

	fmt.Println("Old password:", usersMap[username]["password"])
	fmt.Println("Target:", body["target"])
	usersMap[username]["password"] = encryptPassword(body["target"])
	fmt.Println("New password:", usersMap[username]["password"])

	marshaledUsersMap, err := json.MarshalIndent(usersMap, "", "\t"); if err != nil {
		log.Println("HandleChangePassword: Error marshaling users map:", err)
		return
	}

	if err := os.WriteFile(AssetsPath + "/users.json", marshaledUsersMap, 0777); err != nil {
		log.Println("HandleChangePassword: Error writing to " + AssetsPath + "/users.json:", err)
	}
}

func HandleLogout(w http.ResponseWriter, r *http.Request) {
	uuid := r.URL.Query().Get("uuid")
	w.Header().Add("cache-control", "max-age=3600")
	username := ValidateUser(uuid); if username == "__userinvalid" {
		log.Println("HandleLogout: User invalid!")
		w.Write([]byte("__userinvalid"))
		return
	}

	usersMap := parseUsersJSON()

	whitelist := usersMap[username]["whitelist"].(map[string]interface{})
	delete(whitelist, uuid)

	w.Header().Add("cache-control", "max-age=3600")
	if marshaledMap, err := json.MarshalIndent(usersMap, "", "\t"); err == nil {
		os.WriteFile(AssetsPath + "/users.json", marshaledMap, 0777)
		w.Write([]byte("__ok"))
	} else {
		log.Println("Failed to marshal users map:", err)
		w.Write([]byte("__fail"))
	}
}

func HandleLogoutAll(w http.ResponseWriter, r *http.Request) {
	uuid := r.URL.Query().Get("uuid")
	w.Header().Add("cache-control", "max-age=3600")
	username := ValidateUser(uuid); if username == "__userinvalid" {
		log.Println("HandleLogout: User invalid!")
		w.Write([]byte("__userinvalid"))
		return
	}

	usersMap := parseUsersJSON()

	usersMap[username]["whitelist"] = map[string]string{}

	w.Header().Add("cache-control", "max-age=3600")
	if marshaledMap, err := json.MarshalIndent(usersMap, "", "\t"); err == nil {
		os.WriteFile(AssetsPath + "/users.json", marshaledMap, 0777)
		w.Write([]byte("__ok"))
	} else {
		log.Println("Failed to marshal users map:", err)
		w.Write([]byte("__error"))
	}
}
