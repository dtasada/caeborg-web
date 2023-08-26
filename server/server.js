const express = require('express');
const http = require('http');
const request = require('request');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'server/.env' })

const node_port = 3000;
const express_port = 8000;
const app = express();

console.log(typeof process.env.rootdir);
if (process.env.rootdir !== undefined) {
	console.log(`Project root directory: ${process.env.rootdir}`);
} else {
	console.log('%c`rootdir` is undefined.\nPlease make sure to define it in your %c`server/.env` file.', 'font-weight: bold; font-style: italic');
}
console.log(`Express Static FTP hosted at port ${express_port}`);

app.use(express.static(`${process.env.rootdir}/client/public`));
app.listen(express_port);

const server = http.createServer(function(request, response) {
	response.writeHead(200, { 'Content-Type': 'text/html' });
	fs.readFile(`${process.env.rootdir}/client/public/index.html`, function(error, data) {
		if (error) {
			response.writeHead(404);
			response.write('Error: File Not Found');
		} else {
			response.write(data);
		}
		response.end();
	});

	// request("http://localhost:8000", async (error, response, body) => {
	// 	if (error) {
 //    response.writeHead(404);
 //    response.write('Error: File Not Found');
	// 	} else {
	// 		response.write(body);
	// 	}
	// 	response.end();
	// });
});

server.listen(node_port, function(error) {
	if (error) {
		console.log('Something went wrong', error)
	} else {
		console.log(`Node webserver hosted at port ${node_port}`)
	}
});
