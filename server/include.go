package server

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/u2takey/ffmpeg-go"
)

var (
	Domain    = "caeborg.dev"
	TlsConfig = &tls.Config{}

	CWD, _        = os.Getwd()
	PublicPath    = CWD + "/client/public"
	PubAssetsPath = PublicPath + "/assets"

	IpAddr     string
	AssetsPath string

	DevMode          = false
	Args    []string = os.Args[1:]
)

func parseBody[targetType any](r *http.Request) interface{} {
	var body targetType
	if err := json.Unmarshal(ReadBody(r), &body); err != nil {
		log.Println("Error parsing JSON: ", err)
		return err
	}
	return body
}

func convertImage(path string) {
	ffmpeg_go.Input(path).Output(strings.Split(path, ".tmp")[0] + ".avif").GlobalArgs("-y").ErrorToStdOut().Run()
	if err := os.Remove(path); err != nil {
		log.Println("convertImage: Failed to remove " + path)
	}
}

func ServeFile(w http.ResponseWriter, r *http.Request) {
	page := strings.Split(strings.Split(fmt.Sprintf("%v", r.URL), "/")[1], "?")[0]
	file, err := os.ReadFile(fmt.Sprintf("%s/pages/%s.html", PublicPath, page))
	if err != nil {
		log.Printf("Couldn't read %s.html", page)
	}
	w.Header().Add("cache-control", "no-store,no-cache,must-revalidate,max-age=0")
	w.Write(file)
}

func ReadBody(r *http.Request) []byte {
	requestBodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
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

	usersBin, err := os.ReadFile(path)
	if err != nil {
		log.Println("Error reading users.json", err)
	}

	if string(usersBin) == "" {
		usersBin = []byte(`{}`)
		if err := os.WriteFile(path, usersBin, 0777); err != nil {
			log.Println("Error creating chat.json")
		}
	}

	var usersMap map[string]map[string]interface{}
	err = json.Unmarshal(usersBin, &usersMap)
	if err != nil {
		log.Println("Failed to unmarshal users.json:", err)
	}
	return usersMap
}

func ValidateUser(uuid string) string {
	usersBin, err := os.ReadFile(AssetsPath + "/users.json")
	if err != nil {
		log.Println("Error reading users.json", err)
	}

	var usersMap map[string]map[string]interface{}
	err = json.Unmarshal(usersBin, &usersMap)
	if err != nil {
		log.Println("Failed to unmarshal users.json:", err)
	}

	for username, userData := range usersMap {
		whitelist, ok := userData["whitelist"].(map[string]interface{})
		if ok {
			for uuid, lifetime := range whitelist {
				if time.Now().Unix()-int64(lifetime.(float64)) > 259200 { // 3 days
					delete(whitelist, uuid)

					if marshaledMap, err := json.MarshalIndent(usersMap, "", "\t"); err != nil {
						log.Println("Failed to marshal users map:", err)
					} else {
						os.WriteFile(AssetsPath+"/users.json", marshaledMap, 0777)
					}
				}
			}

			// stupid std::slices lib won't accept an interface, so i have to format string substring it??
			if strings.Contains(fmt.Sprintf("%v", whitelist), uuid) {
				return username
			}
		}
	}
	return "__userinvalid"
}

func encryptPassword(source string) string {
	secretPath := AssetsPath + "/credentials/auth_secret"
	if !fileExists(secretPath) {
		fmt.Println(secretPath + " does not exist! Regenerating auth_secret file...")
		os.Create(secretPath)
	}

	secret, err := os.ReadFile(secretPath)
	if err != nil {
		log.Println("Error reading auth_secret:", err)
		return "__error"
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

	block, err := aes.NewCipher(secret)
	if err != nil {
		log.Println("Error encrypting:", err)
	}

	cfb := cipher.NewCFBEncrypter(block, []byte{35, 46, 57, 24, 85, 35, 24, 74, 87, 35, 88, 98, 66, 32, 14, 05})
	passwordBytes := []byte(source)
	cipherText := make([]byte, len(passwordBytes))
	cfb.XORKeyStream(cipherText, passwordBytes)
	encryptedPassword := base64.StdEncoding.EncodeToString(cipherText) // no reason to encode in b64, but just cuz
	return encryptedPassword
}

func fileSize(b int64) string {
	const unit = 1000
	if b < unit {
		return fmt.Sprintf("%d B", b)
	}
	div, exp := int64(unit), 0
	for n := b / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}

	return fmt.Sprintf("%.1f %cB",
		float64(b)/float64(div), "kMGTPE"[exp])
}

func init() {
	if len(Args) != 0 {
		if Args[0] == "dev" {
			DevMode = true
			IpAddr = "localhost"
			Domain = "localhost"
		} else {
			log.Fatal("Unknown argument: " + Args[0])
		}
	}

	if DevMode {
		AssetsPath = "./assets"
	} else {
		AssetsPath = "/var/www/caeborg_assets"
	}
}
