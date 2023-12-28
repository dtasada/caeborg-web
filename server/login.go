package server

import (
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
	var path string
	if DevMode {
		path = "./assets/users.json"
	} else {
		path = "/var/www/caeborg_assets/users.json"
	}
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
	bodyBytes, err := io.ReadAll(r.Body);
	if err != nil {
		log.Println("Could not read request body:", err)
		return
	}
	
	var userPassPair map[string]string
	err = json.Unmarshal(bodyBytes, &userPassPair)
	if err != nil {
		log.Printf("Could not unmarshal requested user password pair: %v", err)
		return
	}

	// Validate
	password, userExists := usersMap[userPassPair["username"]]
	if userExists {
		if userPassPair["password"] == password {
			fmt.Println("User is valid!")
		} else {
			fmt.Println("User is invalid!")
			userExists = false
		}
	} else {
		usersMap[userPassPair["username"]] = userPassPair["password"]
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

		w.Write([]byte(userPassPair["username"]))
	} else {
		w.Write([]byte("?userinvalid"))
	}
}
