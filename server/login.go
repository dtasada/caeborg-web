package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

func HandleValidation(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("cache-control", "no-store")

	requestBodyBytes := ReadBody(r)
	request := string(requestBodyBytes)

	usersMap := parseUsersJSON()

	if strings.Contains(fmt.Sprintf("%v", usersMap), request) {
		log.Println("User checkup is valid!")
		w.Write([]byte("?uservalid"))
	} else {
		log.Println("User rejected!")
		w.Write([]byte("__userinvalid"))
	}
}

func HandleAuth(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("cache-control", "no-store")

	// Grab existing user-password index
	path := AssetsPath + "/users.json"
	usersMap := parseUsersJSON()

	// Read and parse request
	requestBodyBytes := ReadBody(r)
	var request map[string]string
	err := json.Unmarshal(requestBodyBytes, &request)
	if err != nil {
		log.Printf("Could not unmarshal requested user password pair: %v", err)
		return
	}

	// Encrypt password
	encryptedPassword := encryptPassword(request["password"])
	if encryptedPassword == "__error" {
		w.Write([]byte("?error"))
		return
	}

	// Validate
	userData := usersMap[request["username"]]

	if _, userExists := userData["password"]; userExists {
		if userData["password"] == "" {
			userData["password"] = encryptedPassword
		}
		if encryptedPassword == userData["password"] {
			log.Println("User password correct")
		} else {
			log.Println("User password was wrong!")
			w.Write([]byte("__userinvalid"))
			return
		}
	} else {
		userData = map[string]interface{}{
			"launcher": map[string]string{},
			"userSettings": map[string]string{
				"colorScheme": "Catppuccin Dark",
				"userFont":    "JetBrains Mono",
			},
			"password":  encryptedPassword,
			"whitelist": map[string]interface{}{},
		}
		usersMap[request["username"]] = userData
		log.Printf("Created new user '%s'!\n", request["username"])
	}

	userData["whitelist"].(map[string]interface{})[request["uuid"]] = time.Now().Unix()

	writeBytes, err := json.MarshalIndent(usersMap, "", "\t")
	if err != nil {
		log.Println("Could not marshal user-password map:", err)
		return
	}
	os.WriteFile(path, writeBytes, 0777)

	w.Write([]byte("ok"))
}
