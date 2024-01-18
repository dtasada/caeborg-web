package server

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

var (
	Domain = "caeborg.dev"
	TlsConfig = &tls.Config {}

	PATH, _ = os.Getwd()
	PUBLIC = PATH + "/client/public"

	IpAddr string
	AssetsPath string

	DevMode = false
	Args []string = os.Args[1:]
)

func ServeFile(w http.ResponseWriter, r *http.Request) {
	page := strings.Split(strings.Split(fmt.Sprintf("%v", r.URL), "/")[1], "?")[0]
	file, err := os.ReadFile(fmt.Sprintf("%s/pages/%s.html", PUBLIC, page)); if err != nil {
		log.Printf("Couldn't read %s.html", page)
	}
	w.Write(file)
}

func ReadBody(r *http.Request) []byte {
	requestBodyBytes, err := io.ReadAll(r.Body); if err != nil {
		log.Println("Failed to read request body:", err)
		return nil
	}
	r.Body.Close()
	
	return requestBodyBytes
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return !errors.Is(err, os.ErrNotExist)
}

func parseUsersJSON() map[string]map[string]interface{} {
	usersBin, err := os.ReadFile(AssetsPath + "/users.json"); if err != nil {
		log.Println("Error reading users.json", err)
	}

	var usersMap map[string]map[string]interface{}
	err = json.Unmarshal(usersBin, &usersMap); if err != nil {
		log.Println("Failed to unmarshal users.json:", err)
	}
	return usersMap
}

func ValidateUser(uuid string) string {
	usersBin, err := os.ReadFile(AssetsPath + "/users.json"); if err != nil {
		log.Println("Error reading users.json", err)
	}

	var usersMap map[string]map[string]interface{}
	err = json.Unmarshal(usersBin, &usersMap); if err != nil {
		log.Println("Failed to unmarshal users.json:", err)
	}

	for username, userData := range usersMap {
		whitelist, ok := userData["whitelist"].([][]interface{}); if ok {
			if time.Now().Unix() - whitelist[1].(int) < 259200 {

			}
			// stupid std::slices lib won't accept an interface, so i have to format string substring it??
			if strings.Contains(fmt.Sprintf("%v", whitelist), uuid) {
				return username
			}
		}
	}
	return "?userinvalid"
}

func init() {
	if len(Args) != 0 {
		if Args[0] == "dev" {
			DevMode = true
			IpAddr = "localhost"
			Domain = "localhost"
		} else {
			log.Fatal("Unknown argument" + Args[0])
		}
	}

	if DevMode {
		AssetsPath = "./assets"
	} else {
		AssetsPath = "/var/www/caeborg_assets"
	}
}
