## Todo
* [ ] Optimize frontend HTML CSS & JS
* [ ] Rebuild color themes and sidebar hiding
* [ ] Make Paint tool

## Notes
* To run the web server, run `go run *.go` in `caeborg-web/`.
* To run the server in its dev mode, run `go run main.go dev` in `caeborg-web/`. `dev` includes SCSS compilation.
* To compile SCSS to CSS loosely, run `sass --watch ./client/public/styles:./client/public/.css` in `caeborg-web/`.

## Setup
### Server setup
```
[Unit]
Description=Caeborg
Requires=network.target
After=network.target systemd-ask-password-console.service multi-user.target

[Service]
User=root
WorkingDirectory=/var/www/caeborg.dev
ExecStart=/usr/bin/sudo /var/www/caeborg.dev/releases/caeborg_linux_arm64
ExecReload=/usr/bin/sudo /var/www/caeborg.dev/releases/caeborg_linux_arm64
Type=simple
Restart=always
TimeoutSec=360

[Install]
WantedBy=default.target
```
* Copy the example systemd service file to the systemd services folder `/usr/lib/systemd/system/` as root.
* Enable the service with `systemctl enable --now caeborg`.
* Don't forget to `chmod +rwx ./releases/*` and `chmod +rwx ./server/besticon/*` to avoid permission errors.
### HTTPS Development
For your development environment to work correctly, you need to set up HTTPS keys. These are self-signed keys intended only for development use.
* To create the self-signed SSL key, run `openssl req -x509 -newkey rsa:4096 -keyout ./credentials/privkey.pem -out ./credentials/fullchain.pem -sha256 -days 365`.
* Then remove the passcode `openssl rsa -in ./credentials/privkey.pem -out ./credentials/privkey.pem -passin pass:1234`.
* These keys are saved in `caeborg-web/assets/credentials` during development.
    * The required keys are `cert.pem` and `key.pem` for HTTPS.

## Development dependencies
* `go` (v1.18)
* `dart-sass` or `node-sass` is required for SCSS transpilation.

## CaeborgDiscordBot functions to implement:
* [ ] deofhet
* [ ] weather
* [ ] ascii
* [ ] define word
* [ ] spanish
* [ ] meme
