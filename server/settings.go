package server

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
)

var (
	Domain = "caeborg.dev"
	TlsConfig = &tls.Config {}
	DevMode = false
	PATH, _ = os.Getwd()
	PUBLIC = PATH + "/client/public"
	IpAddr string
	AssetsPath string
)

func ValidateUser(uuid string) string {
	usersBin, err := os.ReadFile(AssetsPath + "/users.json"); if err != nil {
		log.Println("Error reading users.json", err)
	}

	var usersMap map[string]map[string]interface{}
	err = json.Unmarshal(usersBin, &usersMap); if err != nil {
		log.Println("Failed to unmarshal users.json:", err)
	}

	for username, userData := range usersMap {
		whitelist, ok := userData["whitelist"].(interface{}); if ok {
			// stupid std::slices lib won't accept an interface, so i have to format string substring it??
			if strings.Contains(fmt.Sprintf("%v", whitelist), uuid) {
				return username
			}
		}
	}
	return "?userinvalid"
}

func init() {
	if args := os.Args[1:]; len(args) != 0 {
		if args[0] == "dev" {
			DevMode = true
			IpAddr = "localhost"
			Domain = "localhost"
		}
	}

	if DevMode {
		AssetsPath = "./assets"
	} else {
		AssetsPath = "/var/www/caeborg_assets"
	}
}
