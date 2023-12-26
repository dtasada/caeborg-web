package server

import (
	// "fmt"
	"fmt"
	"io"
	"log"
	"net/http"
	"context"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var (
	clientId, clientSecret []byte
	googleOauthConfig *oauth2.Config
)

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, googleOauthConfig.AuthCodeURL("random"), http.StatusTemporaryRedirect)
}

func HandleCallback(w http.ResponseWriter, r *http.Request) {
	if r.FormValue("state") != "random" {
		log.Println("State is not valid!")
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	token, err := googleOauthConfig.Exchange(context.Background(), r.FormValue("code"))
	if err != nil {
		log.Println("Could not get token:", err)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	res, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		log.Println("Could not create get request:", err)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	content, err := io.ReadAll(res.Body)
	if err != nil {
		log.Println("Could not parse response:", err)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	fmt.Fprintf(w, "Response: %s", content)
	defer res.Body.Close()
}

func Auth() {
	var clientIdPath, clientSecretPath string
	if DevMode {
		clientIdPath = "./credentials/client_id"
		clientSecretPath = "./credentials/client_secret"
	} else {
		clientIdPath = "/var/www/caeborg_credentials/client_id"
		clientSecretPath = "/var/www/caeborg_credentials/client_secret"
	}

	clientId, err := os.ReadFile(clientIdPath);			if err != nil { log.Printf("Failed to load %s: %v\n", clientIdPath, err) }
	clientSecret, err := os.ReadFile(clientSecretPath);	if err != nil { log.Printf("Failed to load %s: %v\n", clientSecretPath, err) }

	googleOauthConfig = &oauth2.Config {
		RedirectURL: "https://" + Domain + "/oauth_callback",
		ClientID: string(clientId),
		ClientSecret: string(clientSecret),
		Scopes: []string { "https://www.googleapis.com/auth/userinfo.email" },
		Endpoint: google.Endpoint,
	}
}

