## Todo
* [Flexbox](https://www.youtube.com/watch?v=fYq5PXgSsbE) setup (first on `launcher.html`)
* ~~Figure out how to do caching~~
* ~~Remove ExpressJS from equation and replace file hosting with Node, or stop using FTP hosting. // Nevermind~~
* ~~Fix Node Server CSS'ing (file paths?)~~
* ~~To compile SCSS to CSS, run `sass --watch src/sass:public` in `caeborg-web/client`~~
* ~~Migrate to SCSS~~

## Notes
* To run Node Server, run `npm start` in `caeborg-web/`
* To run Node in dev environment, run `npm run dev` in `caeborg-web/`. `dev` includes SCSS compilation.
* When running `npm start` from `caeborg-web/`, it behaves like `server.js` is located in `caeborg-web/`, not in `caeborg-web/server/`.

## Development dependencies
* `node` (v18)
* `dart-sass` or `node-sass` is required for SCSS editing.

The application itself requires these packages to run:
* `dotenv`
* `express`
* `nodemon` is recommended for development.
* `request`

Run `npm install` to install all dependencies automatically.
