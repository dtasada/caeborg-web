package server

import (
	// "encoding/json"
	// "os"
	"encoding/json"
	"log"
	"net/http"
	"fmt"
	"os"
)

func HandleFetchLauncher(w http.ResponseWriter, r *http.Request) {
	uuid := r.URL.Query().Get("uuid")
	username := ValidateUser(uuid); if username == "?userinvalid" {
		w.Write([]byte("?userinvalid"))
		return
	}

	usersMap := parseUsersJSON()
	launcherInterface := usersMap[username]["launcher"]
	launcherMap, err := json.Marshal(launcherInterface); if err != nil {
		log.Println("Could not marshal launcher interface")
	}
	w.Write(launcherMap)
}

func HandlePostLauncher(w http.ResponseWriter, r *http.Request) {
	fmt.Println("asdfsadfsafsdfsadhfjkhfksalhdfsadjf")
	requestBodyBytes := ReadBody(r)

	var bodyMap map[string]string
	json.Unmarshal(requestBodyBytes, &bodyMap)
	username := ValidateUser(bodyMap["uuid"]); if username == "?userinvalid" {
		log.Println("User is invalid!")
	}

	var newLauncher map[string]string
	json.Unmarshal([]byte(bodyMap["object"]), &newLauncher)

	usersMap := parseUsersJSON()
	usersMap[username]["launcher"] = newLauncher

	target, err := json.MarshalIndent(usersMap, "", "\t"); if err != nil {
		log.Println("Could not marshal users map:", err)
	}
	fmt.Println("target", target)
	os.WriteFile(AssetsPath + "/users.json", target, 0777)
}
