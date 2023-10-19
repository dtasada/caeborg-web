const https = require('https');
const express = require('express');
const process = require('process');
const bodyParser = require('body-parser');

const express_port = 8000;
const bun_port = 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

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

app.get("/read_chat", async (request, response) => {
	response.end(await Bun.file(`${Bun.env.rootdir}/server/assets/chat.json`).text());
});

app.put("/add_chat", async (request, response) => {
	data = await Bun.file(`${Bun.env.rootdir}/server/assets/chat.json`).text(); // await here is important
	console.log("data:", data);
	console.log("request.body:", request.body);
	data[`${Object.keys(data).length + 1}`] = request.body;
	console.log("new data:", data)
	response.end(JSON.stringify(data));
});

const server = app.listen(express_port, () => console.log(`Express server is listening on port ${express_port}`));

console.log(`Listening on localhost: ${express_port}`);
