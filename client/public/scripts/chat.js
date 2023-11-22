time = new Date();
// P R E R E Q U I S I T E S
const fullUrl = window.location.href.split("/");
const ourUrl = `${fullUrl[0]}//${fullUrl[2]}`;

const ws = new WebSocket(`ws://localhost:8001`);
ws.addEventListener("open", () => {
	ws.send('{"type":"chatFetchAll"}');

	ws.addEventListener("message", async ({ data }) => {
		const json = JSON.parse(data);
		console.log(json);
		if (json.type === "chatJson") {
			for (value of Object.values(json)) {
				await send(value.sender, [ value.content ], false);
			}
		} else if (json.type === "chatFetchMessage") {
			await send(json.sender, [ json.content ], false);
		}
	});
});

// html tags as variables
const output_sec = document.getElementById('output-sec');
output_sec.scrollTop = output_sec.scrollHeight;
const output_ol = document.getElementById('output-ol');
const submit = document.getElementById('submit-button');
submit.addEventListener('click', async () => {
	await send('user', [ input.value ], true);
	input.value = '';
	localStorage.setItem('saved_chat_input_value', input.value);
});

const addButton = document.getElementById('add-button');
addButton.addEventListener('click', () => {
	const inputFile = document.createElement('input');
	inputFile.type = 'file';
	inputFile.hidden = true;

	inputFile.addEventListener("change", (event) => {
		const file = event.target.files[0];
		if (file) {
			reader = new FileReader();
			reader.onload = (e) => {
				img = document.createElement("img");
				img.src = e.target.result;
				img.alt = file.name;
				img.width = "300";
				send("user", [img])
				inputFile.value = null;
				ascii(img)
			};
			reader.readAsDataURL(file);
		}
	});

	inputFile.click();
});

const input = document.getElementById('input-box');
input.focus();
input.addEventListener('keydown', (event) => {
	switch (event.key) {
		case 'Enter':
			send("user", [ input.value ], true)
			input.value = "";
			localStorage.setItem('saved_chat_input_value', input.value);
			break;
	}
});

input.oninput = () => { localStorage.setItem('saved_chat_input_value', input.value); }

// important functions

async function send(sender, msgs, shouldPost=false) {
	if (sender) {
		// render html message
		const li = document.createElement('li');

		pfp = document.createElement('img');
		pfp.classList.add(`sender-is-${sender}`, 'pfp');
		pfp.src = await fetch(`${ourUrl}/assets/users/${sender}.png`).then(response => {
				if (response.status === 200) return `${ourUrl}/assets/users/${sender}.png`
				else if (response.status === 404) return `${ourUrl}/icons/url=https://${sender}&size=32..40..64`;
		});
		li.appendChild(pfp);

		const senderP = document.createElement('p');
		senderP.innerHTML = sender;
		senderP.classList.add('usernameTag');
		li.appendChild(senderP);

		for (const msg of msgs) {
			if (typeof msg === 'string') {
				const p = document.createElement('p');
				p.innerHTML = msg;
				li.appendChild(p);
				if (shouldPost === true) {
					ws.send(JSON.stringify({
						content: msg,
						date: `${time.toLocaleDateString()}`,
						sender: sender,
						time: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
						type: "chatPostMessage"
					}));
				}
			} else {
				li.appendChild(msg);
				console.log(msg);
				// if (startup === true) {
				// addMessage({
				// 		content: msg.src,
				// 		date: `${time.toLocaleDateString()}`,
				// 		sender: sender,
				// 		time: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
				// 		type: "chatAddImage"
				// 	});
				// } // upload images to server!
			}
		}

		if (shouldPost === false) output_ol.appendChild(li);
		localStorage.setItem('saved_chat_output_ol', output_ol.outerHTML);
		document.getElementById('output-sec').scrollTop = document.getElementById('output-sec').scrollHeight;

	}
}

// function addMessage(body) {
// 	await fetch(`${ourUrl}/add_chat`, {
// 		method: "PUT",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify(body)
// 	});
// }

// main text parser and lexer
function httpGet(theUrl) {
	const xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false);
	xmlHttp.send(null);
	return xmlHttp;
}
