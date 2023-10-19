time = new Date();
// P R E R E Q U I S I T E S
const fullUrl = window.location.href.split(/:/g)
const ourUrl = `${fullUrl[0]}:${fullUrl[1]}`;

let chat_input_array = localStorage.getItem('chat_input_array');
if (chat_input_array === null || typeof chat_input_array === 'string') chat_input_array = [];
let arrowup_index = -1

// Starting localStorage values
function startLocalStorage() {
	const output_sec = document.getElementById('output-sec');
	const output_ol = document.createElement('ol');
	if (localStorage.getItem('saved_chat_output_ol') === null) {
		output_ol.id = 'output-ol';
		output_sec.appendChild(output_ol);
	} else {
		output_sec.appendChild(output_ol);
		output_ol.outerHTML = localStorage.getItem('saved_chat_output_ol');

		output_sec.scrollTop = output_sec.scrollHeight;
	}
}
startLocalStorage();

// html tags as variables
const output_list = document.getElementById('output-ol');
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
			arrowup_index = -1
			break;
		case 'ArrowUp':
			if (chat_input_array[arrowup_index + 1] !== undefined) {
				arrowup_index += 1;
				input.value = chat_input_array[arrowup_index];
			}
			localStorage.setItem('chat_input_array', chat_input_array)
			break;
		case 'ArrowDown':
			if (chat_input_array[arrowup_index - 1] !== undefined) {
				arrowup_index -= 1;
				input.value = chat_input_array[arrowup_index];
			}
			localStorage.setItem('chat_input_array', chat_input_array)
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
		pfp.src = `${ourUrl}:8000/assets/${sender}.png`;
		li.appendChild(pfp);

		for (msg of msgs) {
			if (typeof msg === 'string') {
				const p = document.createElement('p');
				p.innerHTML = msg;
				li.appendChild(p);
			} else {
				li.appendChild(msg);
			}
		}
		output_list.appendChild(li);
		localStorage.setItem('saved_chat_output_ol', output_list.outerHTML);
		document.getElementById('output-sec').scrollTop = document.getElementById('output-sec').scrollHeight;

		addMessage({
			content: msg,
			sender: sender,
			date: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
			time: `${time.toLocaleDateString()}`
		});
	}
}

async function addMessage(body) {
	return await fetch(`${ourUrl}:8000/add_chat`, {
		"method": "PUT",
		"headers": { "Content-Type": "application/json" },
		"body": JSON.stringify(body)
		})
		.then(response => response.json())
		.then(data => { return data });
}

// main text parser and lexer

async function parseInput(text) {
	// init variables
	send('user', [ text ]);
	chat_input_array.unshift(text);
	localStorage.setItem('chat_input_array', chat_input_array);
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
