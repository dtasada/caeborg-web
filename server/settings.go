package server

import (
	"crypto/tls"
	"os"
)

var (
	Domain = "caeborg.dev"
	TlsConfig = &tls.Config {}
	DevMode = false
	PATH, _ = os.Getwd()
	PUBLIC = PATH + "/client/public"
	IpAddr string
)

func init() {
	args := os.Args[1:]
	if len(args) != 0 {
		if args[0] == "dev" {
			DevMode = true
			IpAddr = "localhost"
			Domain = "localhost"
		}
	}

	Auth()
}
