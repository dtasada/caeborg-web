package server

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
)

func HandleValidation(w http.ResponseWriter, r *http.Request) {
	requestBodyBytes := ReadBody(r)
	request := string(requestBodyBytes)

	usersMap := parseUsersJSON()

	if strings.Contains(fmt.Sprintf("%v", usersMap), request) {
		log.Println("User checkup is valid!")
		w.Write([]byte("?uservalid"))
	} else {
		log.Println("User checkup is invalid!")
		w.Write([]byte("?userinvalid"))
	}
}

func HandlePFP(w http.ResponseWriter, r *http.Request) {
	readBodyBytes := ReadBody(r)
	username := ValidateUser(string(readBodyBytes))

	path := PUBLIC + "/assets/users/" + username + ".png"

	if !fileExists(path) {
		path = PUBLIC + "/assets/users/__default.png"
	}

	w.Write([]byte(strings.ReplaceAll(path, PUBLIC, "")))
}

func HandleAuth(w http.ResponseWriter, r *http.Request) {
	// Grab existing user-password index
	path := AssetsPath + "/users.json"
	usersMap := parseUsersJSON()

	// Read and parse request
	requestBodyBytes := ReadBody(r)
	var request map[string]string
	err := json.Unmarshal(requestBodyBytes, &request); if err != nil {
		log.Printf("Could not unmarshal requested user password pair: %v", err)
		return
	}

	// Encrypt password
	secret, err := os.ReadFile(AssetsPath + "/credentials/auth_secret"); if err != nil {
		log.Println("Could not access auth_secret:", err)
		return
	}

	block, err := aes.NewCipher(secret); if err != nil {
		log.Println("Error encrypting:", err)
	}
	cfb := cipher.NewCFBEncrypter(block, []byte{35, 46, 57, 24, 85, 35, 24, 74, 87, 35, 88, 98, 66, 32, 14, 05})
	plainText := []byte(request["password"])
	cipherText := make([]byte, len(plainText))
	cfb.XORKeyStream(cipherText, plainText)
	encryptedPassword := base64.StdEncoding.EncodeToString(cipherText)

	// Validate
	userData := usersMap[request["username"]]
	existingPassword, userExists := userData["password"]
	if userExists {
		if encryptedPassword == existingPassword {
			log.Println("User is valid!")
		} else {
			log.Println("User is invalid!")
			userExists = false
		}
	} else {
		userData = map[string]interface{}{
			"launcher": map[string]string{},
			"password": encryptedPassword,
			"whitelist": []interface{}{},
		}
		usersMap[request["username"]] = userData
		log.Printf("Created new user '%s'!\n", request["username"])
		userExists = true
	}

	if userExists {
		if whitelist, ok := userData["whitelist"].([]interface{}); ok {
			userData["whitelist"] = append(whitelist, request["uuid"])
		} else {
			log.Println("User whitelist does not exist!")
		}

		writeBytes, err := json.MarshalIndent(usersMap, "", "\t");
		if err != nil {
			log.Println("Could not marshal user-password map:", err)
			return
		}
		os.WriteFile(path, writeBytes, 0777)

		w.Write([]byte("ok"))
	} else {
		w.Write([]byte("?userinvalid"))
	}
}
