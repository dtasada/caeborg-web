## Todo
* [Flexbox](https://www.youtube.com/watch?v=fYq5PXgSsbE) setup (first on `launcher.html`)
* Finish scrolling in chat.scss
* FIX NK
* New shortcut button in `launcher.html`
* Check for dependency alternatives in BunJS
* ~~Migrate to bun-js~~
* ~~Figure out how to do caching~~
* ~~Remove ExpressJS from equation and replace file hosting with Node, or stop using FTP hosting. // Nevermind~~
* ~~Fix Node Server CSS'ing (file paths?)~~
* ~~To compile SCSS to CSS, run `sass --watch src/sass:public` in `caeborg-web/client`~~
* ~~Migrate to SCSS~~

## Notes
* To run Bun Server, run `bun start` in `caeborg-web/`
* To run Bun in dev environment, run `bun run dev` in `caeborg-web/`. `dev` includes SCSS compilation.
* When running `bun start` from `caeborg-web/`, it behaves like `server.js` is located in `caeborg-web/`, not in `caeborg-web/server/`.
* `bun run` args include `--url`. This is required during development to specify url as `--url=http://localhost`.

## Development dependencies
* `bun-js` (v1.0)
* `dart-sass` or `node-sass` is required for SCSS editing.

The application itself requires these packages to run:
* `dotenv`
* `express`
* `request`
* `nodemon` is recommended for development.

Run `bun install` to install all dependencies automatically.
