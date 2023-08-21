const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'server/.env' })

const node_port = 3000;
const express_port = 8000;
const app = express();

console.log(`Project root directory: ${process.env.rootdir}`)
console.log(`Express Static FTP hosted at port ${express_port}`)

app.use(express.static(`${process.env.rootdir}/client/public`));
app.listen(express_port);

const server = http.createServer(function(req, res) {
	res.writeHead(200, { 'Content-Type': 'text/html' });
	fs.readFile(`${process.env.rootdir}/client/public/index.html`, function(error, data) {
		if (error) {
			res.writeHead(404);
			res.write('Error: File Not Found');
		} else {
			res.write(data);
		}
		res.end();
	});
});

server.listen(node_port, function(error) {
	if (error) {
		console.log('Something went wrong', error)
	} else {
		console.log(`Node webserver hosted at port ${node_port}`)
	}
});
