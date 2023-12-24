## Todo
* [ ] Set up web sockets for chat
* [ ] Set up single sign on
* [ ] Make Paint tool
* [ ] Fix color scheme switching

## Notes
* To run the web server, run `go run main.go` in `caeborg-web/`
* To run the server in its dev mode, run `go run main.go dev` in `caeborg-web/`. `dev` includes SCSS compilation.
* To compile SCSS to CSS loosely, run `sass --watch ./client/public/styles:./client/public/.css`
in `caeborg-web/`.
### HTTPS Development
For your development environment to work correctly, you need to set up HTTPS keys. These are self-signed keys intended only for development use.
* To create the self-signed SSL key, run `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365`
* Then remove the passcode `openssl rsa -in key.pem -out key.pem -passin pass:1234`

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
