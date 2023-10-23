time = new Date();
// P R E R E Q U I S I T E S
const fullUrl = window.location.href.split("/");
const ourUrl = `${fullUrl[0]}//${fullUrl[2]}`;

// Starting localStorage values
async function serveChat() {
	json = await fetch(`${ourUrl}/read_chat`);
	json = await json.json()
	for (value of Object.values(json)) {
		await send(value.sender, [value.content], true);
	}
}
serveChat();

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
				send("user", [img])
				inputFile.value = null;
				ascii(img)
			};
			reader.readAsDataURL(file);
		}
	});

	inputFile.click();
})

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

async function send(sender, msgs, startup=false) {
	if (sender != null) {
		// render html message
		const li = document.createElement('li');

		pfp = document.createElement('img');
		pfp.classList.add(`sender-is-${sender}`, 'pfp');
		pfp.src = await fetch(`${ourUrl}/assets/users/${sender}.png`)
			.then(response => {
				if (response.status === 200) return `${ourUrl}/assets/users/${sender}.png`
				else if (response.status === 404) return `${ourUrl}/icons/url=https://${sender}&size=32..40..64`;
		});
		li.appendChild(pfp);

		senderP = document.createElement('p');
		senderP.innerHTML = sender;
		senderP.classList.add('usernameTag');
		li.appendChild(senderP);

		for (msg of msgs) {
			if (typeof msg === 'string') {
				const p = document.createElement('p');
				p.innerHTML = msg;
				li.appendChild(p);
			} else {
				li.appendChild(msg);
			}
		}
		output_ol.appendChild(li);
		localStorage.setItem('saved_chat_output_ol', output_ol.outerHTML);
		document.getElementById('output-sec').scrollTop = document.getElementById('output-sec').scrollHeight;

		if (!startup) {
			addMessage({
				content: msg,
				sender: sender,
				date: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
				time: `${time.toLocaleDateString()}`
			});
		}
	}
}

async function addMessage(body) {
	json = await fetch(`${ourUrl}/add_chat`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	})
	json = await json.json();
	return json;
}

// main text parser and lexer

async function parseInput(text) {
	// init variables
	await send('user', [ text ]);
	if (text === "") { return; }
	// execute command
	// if (command in commands) {
	//	 const results = await commands[command].command(args); // do not remove async/await (important for fetch functions (e.g. nk()))
	//	 if (results != null) send('caeborg', results);
	//	 else console.log('Function return is null!')
	// } else {
	//	 // console.log(`Command ${command} not found`);
	//	 send('caeborg', [ `<i>Command '${command}' not found</i>`] );
	// }
}

function httpGet(theUrl) {
	const xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false);
	xmlHttp.send(null);
	return xmlHttp;
}
