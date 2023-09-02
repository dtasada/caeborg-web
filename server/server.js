const process = require('process');
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

fs.readFile(`${process.env.rootdir}/client/public/.env.js`, 'utf-8', (error, contents) => {
    if (error) {
        console.log(error);
        return;
    }

    var customUrl;
    function changeUrl(arg, data) {
        if (arg.includes('--url')) {
            customUrl = arg.split('=')[1];
        } else {
            customUrl = arg;
        }
        let replace = data.replace(/'.*.'/g, `'${customUrl}'`);
        console.log(replace);

        fs.writeFile(`${process.env.rootdir}/client/public/.env.js`, replace ,'utf-8', (error) => {
            if (error) console.log(error)
        });
    }

    changeUrl('https://caeborg.dev', contents);

    for (arg of process.argv) {
        if (arg.includes('--url')) {
            changeUrl(arg, contents);
        }
    }
    console.log(`At '${customUrl}':`);
});


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
