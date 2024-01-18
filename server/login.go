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
	"time"
	"math/rand"
)

func HandleValidation(w http.ResponseWriter, r *http.Request) {
	requestBodyBytes := ReadBody(r)
	request := string(requestBodyBytes)

	usersMap := parseUsersJSON()

	if strings.Contains(fmt.Sprintf("%v", usersMap), request) {
		log.Println("User checkup is valid!")
		w.Write([]byte("?uservalid"))
	} else {
		log.Println("User rejected!")
		w.Write([]byte("?userinvalid"))
	}
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
	secretPath := AssetsPath + "/credentials/auth_secret"
	if !fileExists(secretPath) {
		fmt.Println(secretPath + " does not exist! Regenerating auth_secret file...")
		os.Create(secretPath)
	}

	secret, err := os.ReadFile(secretPath); if err != nil {
		log.Println("Error reading auth_secret:", err)
		return
	}

	if string(secret) == "" {
		secret = make([]byte, 16)
		for i := range secret {
			characters := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
			secret[i] = characters[rand.Intn(len(characters))]
		}
		if err := os.WriteFile(secretPath, secret, 0777); err != nil {
			log.Println("Error creating auth_secret.json")
		}
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
	if _, userExists := userData["password"]; userExists {
		if userData["password"] == "" {
			fmt.Println("here")
			userData["password"] = encryptedPassword
		}
		if encryptedPassword == userData["password"] {
			log.Println("User password correct")
		} else {
			log.Println("User password was wrong!")
			w.Write([]byte("?userinvalid"))
			return
		}
	} else {
		userData = map[string]interface{}{
			"launcher": map[string]string{},
			"password": encryptedPassword,
			"whitelist": map[string]interface{}{},
		}
		usersMap[request["username"]] = userData
		log.Printf("Created new user '%s'!\n", request["username"])
	}

	userData["whitelist"].(map[string]interface{})[request["uuid"]] = time.Now().Unix()

	writeBytes, err := json.MarshalIndent(usersMap, "", "\t"); if err != nil {
		log.Println("Could not marshal user-password map:", err)
		return
	}
	os.WriteFile(path, writeBytes, 0777)

	w.Write([]byte("ok"))
}
