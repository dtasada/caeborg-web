const https = require('https');
const express = require('express');
const process = require('process');

const express_port = 8000;
const bun_port = 3000;
const app = express();

const public_path = `${Bun.env.rootdir}/client/public`

if (process.env.rootdir !== undefined) {
	console.log(`Project root directory: ${process.env.rootdir}`);
} else {
	console.log("'rootdir' is undefined. Please make sure to define it in your 'caeborg-web/.env' file.");
}

let customUrl;
function changeUrl(arg) {
	if (arg.includes('--url')) customUrl = arg.split('=')[1];
	else customUrl = arg;
}

changeUrl('https://caeborg.dev');

for (arg of process.argv) {
	if (arg.includes('--url')) {
		changeUrl(arg);
	}
}
console.log(`At '${customUrl}':`);

app.use(express.static(public_path));

app.get("/", (_, response) => {
	response.sendFile(`${public_path}/index.html`);
});

app.get("/read_chat", async (request, response) => {
	response.end(await Bun.file(`${process.env.rootdir}/server/assets/chat.json`).text());
});

app.get("/add_chat", async (request, response) => {
	data = await Bun.file(`${process.env.rootdir}/server/assets/chat.json`).text();
	data = JSON.parse(data);
	data[`${Object.keys(data).length}`] = request;
	response.end(JSON.stringify(data));
})

const server = app.listen(express_port, () => console.log(`Express server is listening on port ${express_port}`));

console.log(`Listening on localhost: ${express_port}`);
