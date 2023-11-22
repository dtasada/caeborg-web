const https = require('https');
const express = require('express');
const process = require('process');
const bodyParser = require('body-parser');

const express_port = 8000;
// const bun_port = 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const public_path = `${Bun.env.rootdir}/client/public`

if (Bun.env.rootdir !== undefined) {
	console.log(`Project root directory: ${Bun.env.rootdir}`);
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

app.get("/icons*", async (request, response) => {
	url = request.url.split('/icons/')
	response.redirect(`${customUrl}:8080/icon?${url[1]}`)
});

// app.get("/read_chat", async (_, response) => {
// 	response.end(await Bun.file(`${Bun.env.rootdir}/server/assets/chat.json`).text());
// });
//
// app.put("/add_chat", async (request, response) => {
// 	path = `${Bun.env.rootdir}/server/assets/chat.json`;
// 	data = await Bun.file(path).json(); // await here is important
// 	data[`${Object.keys(data).length + 1}`] = request.body;
// 	await Bun.write(path, JSON.stringify(data));
// 	response.end(JSON.stringify(data));
// });

const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8001 });
wss.on("connection", (ws) => {
	ws.on("message", async (request) => {
		request = JSON.parse(request);

		if (request.type === "chatPostMessage") {
			path = `${Bun.env.rootdir}/server/assets/chat.json`;
			data = await Bun.file(path).json(); // await here is important
			request.type = "chatFetchMessage";
			data[`${Object.keys(data).length}`] = request;

			console.log(request);
			ws.send(JSON.stringify(request));

			await Bun.write(path, JSON.stringify(data));
		} else if (request.type === "chatFetchAll") {
			ws.send(await Bun.file(`${Bun.env.rootdir}/server/assets/chat.json`).text());
		}
	});
});

const server = app.listen(express_port, () => console.log(`Express server is listening on port ${express_port}`));
