time = new Date();
// P R E R E Q U I S I T E S
const fullUrl = window.location.origin;

const ws = new WebSocket(`wss://${document.location.host}/chat`);
ws.addEventListener("open", () => {
	console.log("Websocket connected");
	ws.send(JSON.stringify({ type: "chatFetchAll" }));
})

ws.addEventListener("message", async ({ data }) => {
	const json = JSON.parse(data);

	if (json.type === "chatJson") {
		for (value of Object.values(json)) {
			await send(value.sender, [ value.content ]);
		}
	}
	if (json.type === "chatPostMessage") await send(json.sender, [ json.content ]);
});


// html tags as variables
const output_sec = document.getElementById('output-sec');
output_sec.scrollTop = output_sec.scrollHeight;
const output_ol = document.getElementById('output-ol');
const submit = document.getElementById('submit-button');
submit.addEventListener('click', () => {
	parseInput(input.value);
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
				send("user", [ img ])
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
			parseInput(input.value);
			input.value = "";
			localStorage.setItem('saved_chat_input_value', input.value);
		break;
	}
});

input.oninput = () => { localStorage.setItem('saved_chat_input_value', input.value); }

// important functions
async function send(sender, msgs) {
	if (sender != null) {
		// render html message
		const li = document.createElement('li');

		pfp = document.createElement('img');
		pfp.classList.add(`sender-is-${sender}`, 'pfp');
		pfp.src = `${fullUrl}/icon?url=https://${sender}.com&size=64..128..256`
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
			} else {
				li.appendChild(msg);
				console.log(msg);
				// upload images to server!
			}
		}

		output_ol.appendChild(li);
		localStorage.setItem('saved_chat_output_ol', output_ol.outerHTML);
		document.getElementById('output-sec').scrollTop = document.getElementById('output-sec').scrollHeight;
	}
}

async function parseInput(text) {
	// await send('user', [ text ]);
	if (text === "") return;

	if (typeof text === "string") {
		const sender = "user"

		ws.send(JSON.stringify({
			content: text,
			date: `${time.toLocaleDateString()}`,
			sender: sender,
			time: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
			type: "chatPostMessage"
		}));
	}
}
