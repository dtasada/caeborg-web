package server

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	_ "image/png"
	_ "image/jpeg"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Kagami/go-avif"
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

func toAVIF(path string) {
	src, err := os.Open(path); if err != nil {
		log.Println("Can't open source file:", err)
		return
	}

	img, _, err := image.Decode(src); if err != nil {
		log.Println("Can't decode source file:", err)
		return
	}

	if avif.Encode(src, img, &avif.Options{ Quality: 30 }); err != nil {
		log.Println("Can't encode source image:", err)
		return
	}
}

func ServeFile(w http.ResponseWriter, r *http.Request) {
	page := strings.Split(strings.Split(fmt.Sprintf("%v", r.URL), "/")[1], "?")[0]
	file, err := os.ReadFile(fmt.Sprintf("%s/pages/%s.html", PUBLIC, page)); if err != nil {
		log.Printf("Couldn't read %s.html", page)
	}
	w.Header().Add("cache-control", "max-age=3600")
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
	path := AssetsPath + "/users.json"

	if !fileExists(path) {
		fmt.Println(path + " does not exist! Creating template users.json file...")
		os.Create(path)
	}

	usersBin, err := os.ReadFile(path); if err != nil {
		log.Println("Error reading users.json", err)
	}

	if string(usersBin) == "" {
		usersBin = []byte(`{}`)
		if err := os.WriteFile(path, usersBin, 0777); err != nil {
			log.Println("Error creating chat.json")
		}
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
		whitelist, ok := userData["whitelist"].(map[string]interface{}); if ok {
			for uuid, lifetime := range whitelist {
				if time.Now().Unix() - int64(lifetime.(float64)) > 259200 { // 3 days
					delete(whitelist, uuid)

					if marshaledMap, err := json.MarshalIndent(usersMap, "", "\t"); err != nil {
						log.Println("Failed to marshal users map:", err)
					} else {
						os.WriteFile(AssetsPath + "/users.json", marshaledMap, 0777)
					}
				}
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
