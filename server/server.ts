const https = require('https');
const express = require('express');
const process = require('process');
const fs = require('fs');
require('dotenv').config({ path: 'server/.env' })

const express_port = 8000;
const app = express();

const public_path = `${process.env.rootdir}/client/public`

if (process.env.rootdir !== undefined) {
    console.log(`Project root directory: ${process.env.rootdir}`);
} else {
    console.log("'rootdir' is undefined. Please make sure to define it in your 'server/.env' file.");
}

// fs.readFile(`${process.env.rootdir}/client/public/env.js`, 'utf-8', (error, contents) => {
const env_js = Bun.file(`${process.env.rootdir}/client/public/env.js`);
let customUrl;
function changeUrl(arg) {
    if (arg.includes('--url')) {
        customUrl = arg.split('=')[1];
    } else {
        customUrl = arg;
    }
    const replace = `export const ourUrl = '${customUrl}';`
    Bun.write(env_js, replace);
}

changeUrl('https://caeborg.dev', env_js.text());

for (arg of process.argv) {
    if (arg.includes('--url')) {
        changeUrl(arg);
    }
}
console.log(`At '${customUrl}':`);


app.use(express.static(`${process.env.rootdir}/client/public`));

app.listen(express_port, () => console.log(`Express server is listening on port ${express_port}`));

app.get("/", (request, response) => {
    response.sendFile(`${public_path}/index.html`)
});

const server = Bun.serve({
    port: 3000,
    hostname: customUrl.split('://')[1],
    fetch(request) {
        return new Response(Bun.file(`${public_path}/index.html`));
    },
});

console.log(`Listening on localhost: ${server.port}`);
