const https = require('https');
const express = require('express');
const process = require('process');
const fs = require('fs');
const sass = require('node-sass')

const express_port = 8000;
const bun_port = 3000;
const app = express();

const public_path = `${Bun.env.rootdir}/client/public`

if (process.env.rootdir !== undefined) {
    console.log(`Project root directory: ${process.env.rootdir}`);
} else {
    console.log("'rootdir' is undefined. Please make sure to define it in your 'caeborg-web/.env' file.");
}

const env_js = Bun.file(`${public_path}/env.js`);
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


app.use(express.static(public_path));

app.listen(express_port, () => console.log(`Express server is listening on port ${express_port}`));

app.get("/", (request, response) => {
    response.sendFile(`${public_path}/index.html`)
});

const server = Bun.serve({
    port: bun_port,
    hostname: customUrl.split('://')[1],
    async fetch(request) {
        const req_file = request['url'].split(`${customUrl}:${bun_port}/`)[1];
        console.log(req_file);
        // Bun.spawn('bun', 'run', `${Bun.env.rootdir}/${req_file}`);
        return new Response(`${request} Welcome to bun!`);
    },
    error() {
        return new Response(null, { status: 404 });
    }
});

console.log(`Listening on localhost: ${server.port}`);
