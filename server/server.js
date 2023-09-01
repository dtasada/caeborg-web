const express = require('express');
const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: 'server/.env' })

const express_port = 8000;
const app = express();

const public_path = `${process.env.rootdir}/client/public`

if (process.env.rootdir !== undefined) {
	console.log(`Project root directory: ${process.env.rootdir}`);
} else {
	console.log("'rootdir' is undefined.\nPlease make sure to define it in your 'server/.env' file.");
}

app.use(express.static(`${process.env.rootdir}/client/public`));

app.listen(express_port, () => console.log(`Express server is listening on port ${express_port}`));

app.get("/", (request, response) => {
    response.sendFile(`${public_path}/index.html`)
});

// const options = {
//   // key: fs.readFileSync("server.key"),
//   // cert: fs.readFileSync("server.cert"),
// };

// https.createServer(options, app).listen(3000, (request, response) => {
//     console.log(`Server started at port 3000`)
// });
