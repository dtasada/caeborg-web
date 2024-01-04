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
	"strings"
)

func HandleLogin(r http.ResponseWriter, w *http.Request) {
	loginFile, err := os.ReadFile(PUBLIC + "/pages/login.html")
	if err != nil {
		log.Println("Couldn't read login.html")
	}
	r.Write(loginFile)
}

func HandleValidation(w http.ResponseWriter, r *http.Request) {
	requestBodyBytes, err := io.ReadAll(r.Body); if err != nil {
		log.Println("Failed to read request body:", err)
		return
	}

	request := string(requestBodyBytes)

	path := AssetsPath + "/users.json"
	usersFileBin, err := os.ReadFile(path); if err != nil {
		log.Printf("Could not access %s: %v\n", path, err)
		return
	}

	var usersMap map[string]map[string]interface{}
	err = json.Unmarshal(usersFileBin, &usersMap); if err != nil {
		log.Printf("Could not unmarshal %s: %v\n", path, err)
		return
	}

	if strings.Contains(fmt.Sprintf("%v", usersMap), request) {
		log.Println("User checkup is valid!")
		w.Write([]byte("?uservalid"))
	} else {
		log.Println("User checkup is invalid!")
		w.Write([]byte("?userinvalid"))
	}
}

func HandleAuth(w http.ResponseWriter, r *http.Request) {
	// Grab existing user-password index
	path := AssetsPath + "/users.json"

	usersFileBin, err := os.ReadFile(path); if err != nil {
		log.Printf("Could not access %s: %v\n", path, err)
		return
	}

	var usersMap map[string]map[string]interface{}
	err = json.Unmarshal(usersFileBin, &usersMap); if err != nil {
		log.Printf("Could not unmarshal %s: %v\n", path, err)
		return
	}

	// Read and parse request
	requestBodyBytes, err := io.ReadAll(r.Body); if err != nil {
		log.Println("Could not read request body:", err)
		return
	}
	
	var request map[string]string
	err = json.Unmarshal(requestBodyBytes, &request); if err != nil {
		log.Printf("Could not unmarshal requested user password pair: %v", err)
		return
	}

	// Validate
	secret, err := os.ReadFile(AssetsPath + "/credentials/auth_secret"); if err != nil {
		log.Println("Could not access auth_secret:", err)
		return
	}

	// Encrypt
	block, err := aes.NewCipher(secret); if err != nil {
		log.Println("Error encrypting:", err)
	}
	cfb := cipher.NewCFBEncrypter(block, []byte{35, 46, 57, 24, 85, 35, 24, 74, 87, 35, 88, 98, 66, 32, 14, 05})
	plainText := []byte(request["password"])
	cipherText := make([]byte, len(plainText))
	cfb.XORKeyStream(cipherText, plainText)
	encryptedPassword := base64.StdEncoding.EncodeToString(cipherText)

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
		userData["password"] = encryptedPassword
		log.Printf("Created new user '%s'!\n", request["username"])
		userExists = true
	}

	if userExists {
		if whitelist, ok := userData["whitelist"].([]interface{}); ok {
			userData["whitelist"] = append(whitelist, request["uuid"])
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
