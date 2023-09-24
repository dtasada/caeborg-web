## Todo
* Improve Inspirobot CSS'ing
* ~~Make Translator page~~
* ~~New shortcut button in `launcher.html`~~
* ~~Change sidebar hiding mechanic to `win-width < 700; then fullscreen rest-sec`~~
* ~~Finish scrolling in chat.scss~~
* ~~Check for dependency alternatives in bun-js~~
* ~~FIX NK~~
* ~~Migrate to bun-js~~
* ~~[Flexbox](https://www.youtube.com/watch?v=fYq5PXgSsbE) setup (first on `launcher.html`)~~
* ~~Figure out how to do caching~~
* ~~Remove ExpressJS from equation and replace file hosting with Node, or stop using FTP hosting. // Nevermind~~
* ~~Fix Node Server CSS'ing (file paths?)~~
* ~~Migrate to SCSS~~

## Notes
* To run Bun Server, run `bun start` in `caeborg-web/`
* To run Bun in dev environment, run `bun run dev` in `caeborg-web/`. `dev` includes SCSS compilation.
* When running `bun start` from `caeborg-web/`, it behaves like `server.js` is located in `caeborg-web/`, not in `caeborg-web/server/`.
* `.env` file has been moved to `caeborg-web/` (it was previously in `caeborg-web/server`). `Bun.env` reads `.env` files in the directory `bun run` is run in, rather than the directory `server.js` is in.
* `bun run` args include `--url`. When running `bun run dev`, it automatically specifies `--url=http://localhost`
* To compile SCSS to CSS, run `sass --watch src/sass:public` in `caeborg-web/client`.

## Development dependencies
* `bun-js` (v1.0)
* `dart-sass` or `node-sass` is required for SCSS transpilation.

The application itself requires these packages to run:
* `express`
* ~~`nodemon` is recommended for development.~~ // (`nodemon` is not required when using bun-js)
* ~~`dotenv`~~ // (`dotenv` is not required when using bun-js)

Run `bun install` to install all dependencies automatically.
