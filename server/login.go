package server

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

func HandleLogin(r http.ResponseWriter, w *http.Request) {
	loginFile, err := os.ReadFile(PUBLIC + "/pages/login.html")
	if err != nil {
		log.Println("Couldn't read login.html")
	}
	r.Write(loginFile)
}

func HandleAuth(w http.ResponseWriter, r *http.Request) {
	// Grab existing user-password index
	path := AssetsPath + "/users.json"

	usersFileBin, err := os.ReadFile(path); if err != nil {
		log.Printf("Could not access %s: %v\n", path, err)
		return
	}

	var usersMap map[string]string
	err = json.Unmarshal(usersFileBin, &usersMap); if err != nil {
		log.Printf("Could not unmarshal %s: %v", path, err)
		return
	}

	// Read and parse request
	requestBodyBytes, err := io.ReadAll(r.Body);
	if err != nil {
		log.Println("Could not read request body:", err)
		return
	}
	
	var requestedPair map[string]string
	err = json.Unmarshal(requestBodyBytes, &requestedPair)
	if err != nil {
		log.Printf("Could not unmarshal requested user password pair: %v", err)
		return
	}

	// Validate
	secret, err := os.ReadFile(AssetsPath + "/auth_secret")
	existingPassword, userExists := usersMap[requestedPair["username"]]

	unencryptedRequestedPassword := requestedPair["password"]
	bytes := []byte{35, 46, 57, 24, 85, 35, 24, 74, 87, 35, 88, 98, 66, 32, 14, 05}

	block, err := aes.NewCipher(secret); if err != nil { fmt.Println("Error encrypting:", err) }
	plainText := []byte(unencryptedRequestedPassword)
	cfb := cipher.NewCFBEncrypter(block, bytes)
	cipherText := make([]byte, len(plainText))
	cfb.XORKeyStream(cipherText, plainText)
	encryptedPassword := base64.StdEncoding.EncodeToString(cipherText)

	if userExists {
		if encryptedPassword == existingPassword {
			fmt.Println("User is valid!")
		} else {
			fmt.Println("User is invalid!")
			userExists = false
		}
	} else {
		usersMap[requestedPair["username"]] = encryptedPassword
		fmt.Println("Created a new user!")
		userExists = true
	}

	if userExists {
		writeBytes, err := json.Marshal(usersMap);
		if err != nil {
			log.Println("Could not marshal user-password map:", err)
			return
		}
		os.WriteFile(path, writeBytes, 0777)

		w.Write([]byte(requestedPair["username"]))
	} else {
		w.Write([]byte("?userinvalid"))
	}
}
