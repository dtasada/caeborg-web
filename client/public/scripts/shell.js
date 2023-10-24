// P R E R E Q U I S I T E S
const fullUrl = window.location.href.split("/");
const ourUrl = `${fullUrl[0]}//${fullUrl[2]}`;

// C O N S T A N T S
const lidwoordUrl = "https://welklidwoord.nl";
const chemUrl = "https://opsin.ch.cam.ac.uk/opsin";
const urbandictUrl = "https://api.urbandictionary.com/v0/define?term=";
let shell_input_array = localStorage.getItem('shell_input_array');
if (shell_input_array === null || typeof shell_input_array === 'string') shell_input_array = [];
let arrowup_index = -1

// Starting localStorage values
function startLocalStorage() {
	const output_sec = document.getElementById('output-sec');
	const output_ol = document.createElement('ol');
	if (localStorage.getItem('saved_shell_output_ol') === null) {
		output_ol.id = 'output-ol';
		output_sec.appendChild(output_ol);
	} else {
		output_sec.appendChild(output_ol);
		output_ol.outerHTML = localStorage.getItem('saved_shell_output_ol');

		output_sec.scrollTop = output_sec.scrollHeight;
	}
}
startLocalStorage();

// html tags as variables
const output_ol = document.getElementById('output-ol');
const submit = document.getElementById('submit-button');
submit.addEventListener('click', () => {
	parseInput(input.value);
	input.value = '';
	localStorage.setItem('saved_shell_input_value', input.value);
});

const addButton = document.getElementById('add-button');
addButton.addEventListener('click', () => {
	const inputFile = document.createElement('input');
	inputFile.type = 'file';
	inputFile.hidden = true;

	inputFile.addEventListener("change", (event) => {
		console.log("asd");
		const file = event.target.files[0];
		if (file) {
			reader = new FileReader();
			reader.onload = (e) => {
				img = document.createElement("img");
				img.src = e.target.result;
				img.alt = file.name;
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
			localStorage.setItem('saved_shell_input_value', input.value);
			arrowup_index = -1
			break;
		case 'ArrowUp':
			event.preventDefault();
			if (shell_input_array[arrowup_index + 1] !== undefined) {
				arrowup_index += 1;
				input.value = shell_input_array[arrowup_index];
			}
			localStorage.setItem('shell_input_array', shell_input_array)
			break;
		case 'ArrowDown':
			event.preventDefault();
			if (shell_input_array[arrowup_index - 1] !== undefined) {
				arrowup_index -= 1;
				input.value = shell_input_array[arrowup_index];
			}
			localStorage.setItem('shell_input_array', shell_input_array)
			break;
	}
});

input.oninput = () => {
	autocomplete();
	localStorage.setItem('saved_shell_input_value', input.value);
}

// important functions
function send(sender, msgs) {
	if (sender != null) {
		const li = document.createElement('li');

		pfp = document.createElement('img');
		pfp.classList.add(`sender-is-${sender}`, 'pfp');
		pfp.src = `${ourUrl}/assets/users/${sender}.png`;
		li.appendChild(pfp);

		// console.log('msgs: ', msgs);
		// console.log('typeof msgs: ', typeof msgs);
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
		localStorage.setItem('saved_shell_output_ol', output_ol.outerHTML);
		document.getElementById('output-sec').scrollTop = document.getElementById('output-sec').scrollHeight;
	}
}

// main text parser and lexer
async function parseInput(text) {
	// init variables
	send('user', [text]);
	shell_input_array.unshift(text);
	localStorage.setItem('shell_input_array', shell_input_array);
	const args = text.split(' ');
	const command = args.shift();
	if (command === "") { return; }
	// execute command
	if (command in commands) {
		const results = await commands[command].command(args); // do not remove async/await (important for fetch functions (e.g. nk()))
		if (results != null) send('caeborg', results);
		else console.log('Function return is null!')
	} else {
		// console.log(`Command ${command} not found`);
		send('caeborg', [ `<i>Command '${command}' not found</i>`] );
	}
}

function autocomplete() {
	for (command in commands) {
		if (command.includes(input.value)) {
			const i = command.indexOf(input);
			if (i === -1) {
				const validlenofinput = input.length;
				// console.log(`${input.value} is found in ${command}`);
			} else {
				// console.log(`${input.value} is not found in ${command}`);
			}
		}
	}
} // https://codepen.io/dwidomski/pen/OWOBdr

function httpGet(theUrl) {
	const xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false);
	xmlHttp.send(null);
	return xmlHttp;
}

// dict of functions
const commands = {
	chem: {
		brief: 'Gives the structure of given IUPAC organic compound name',
		command: (args) => {
			// init
			const compound = args.join(' ');
			const url = `${chemUrl}/${compound}.png`;
			img = document.createElement('img');
			const response = httpGet(url);
			const text = response.responseText;
			if (response.status === 404) {
				const importantMessage = text.split('as follows:')[1];
				return [ importantMessage ];
			} else {
				img.src = url;
				img.classList.add('compound-img');
				return [ `IUPAC nomenclature for '${bi(compound)}':`, img ];
			}
		}
	},

	clear: {
		brief: 'Clears the screen',
		command: () => {
			while(output_ol.firstChild) {
				output_ol.removeChild(output_ol.firstChild);
			}
			localStorage.setItem('saved_shell_output_ol', output_ol.outerHTML);
			return null;
		}
	},

	// define: {
	// 	brief: "Gives you the correct definition of the word",
	// 	command: async function(args) {
	// 		const term = args[0];
	// 		const url = urbandictUrl + term;
	// 		const response = await fetch(url);
	// 		const js = await response.json();
	// 		alert(js);
	// 	}
	// },
	
	dict: {
		brief: "Gives word definitions from <i>dictionaryapi.dev</i>",
		command: async (args) => {
			let command = null;
			for (i in args) {
				if (["--synonyms", "--antonyms", "--full"].includes(args[i])) {
					command = args[i];
					args.splice(i, 1);
				}
			}
			word = args[args.length - 1];
			dataJson = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
			dataJson = await dataJson.json();
			// console.log(JSON.stringify(dataJson, "<br>", "\t"))
			// if (command === "--full") return [ JSON.stringify(dataJson) ]
			// else {
			// 	let returnArray = [ bi(word + ':') ]
			// 	for (index of Object.values(dataJson)) {
			// 		for (key of Object.keys(index)) {
			// 			value = index[property];
			// 			if (key === "meanings") {
			// 				for (meaning in key) {
			//
			// 				}
			// 			}
			// 		}
			// 	}
			// 	// return
			// }
		},
	},

	deofhet: {
		brief: "Gives you the article of given Dutch word - <i>de</i> or <i>het</i>",
		command: async (event) => {
			dataJson = await fetch(`${lidwoordUrl}/appel`)
			dataJson = await response.json()
			return [ dataJson[0][0][0] ];
		}
	},

	help: {
		brief: "Lists all commands available in the <i>Chat</i> scope",
		command: (args) => {
			let ret = ''
			for (const [k, v] of Object.entries(commands)) {
				ret += `${bi(k)}: ${v.brief}<br>`;
			}
			return [ret]
		}
	},

	nk: {
		brief: 'Returns physics formulas. `list` for list of available arguments',
		command: async (args) => {
			nk_json = await fetch(`${ourUrl}/assets/physics.json`);
			nk_json = await nk_json.json();
			if (args[0] !== 'list') {
				const array = nk_json[args[0]];
				const base_formula = array[0];
				const definitions = array[1].join('<br>');

				console.log('nk_json:', nk_json);
				if (args[0] === 'list') {
					return [object.keys(nk_json).join('<br>')];
				} else {
					console.log('were here!');
					return [
						`base formula for ${bi(args[0])}:<br> ${bi(base_formula)}`,
						`contextual definitions:<br> ${bi(definitions)}`
					];
				}
			} else {
				const all = Object.keys(nk_json);
				let brief = []
				for ([key, value] of Object.entries(nk_json)) {
					brief.push(`${key}: ${bi(value[0])}`);
				}
				return [ `${brief.join('<br>')}` ];
			}
		}
	},

	ping: {
		brief: 'Ping user back',
		command: (_) => {
			return ["pong!"];
		}
	},

}


// Other functions
// function attachImage() {
//
// }

function bi(str) {
	return `<b><i>${str}</i></b>`;
}

function ascii(img) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	context.drawImage(img, 0, 0);
	const arr = context.getImageData(0, 0, img.width, img.height).data;

	for (let i=0; i<arr.length; i+=4) {
		const red = arr[i];
		const green = arr[i + 1];
		const blue = arr[i + 2];
		const alpha = arr[i + 3];
		console.log(red, green, blue, alpha);
	}
}
