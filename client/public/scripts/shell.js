// Constants
const lidwoordUrl = "https://welklidwoord.nl";
const chemUrl = "https://opsin.ch.cam.ac.uk/opsin";
const urbandictUrl = "https://api.urbandictionary.com/v0/define?term=";
let shellInputArray = localStorage.shellInputArray;
if (!shellInputArray || typeof shellInputArray === "string") shellInputArray = [];
let arrowUpIndex = -1;
let shouldHelp;

// Starting localStorage values
function startLocalStorage() {
	const outputSec = document.getElementById("output-sec");
	const outputOl = document.createElement("ol");
	if (!localStorage.savedShellOutputOl) {
		outputOl.id = "output-ol";
		outputSec.appendChild(outputOl);
		shouldHelp = true;
	} else {
		outputSec.appendChild(outputOl);
		outputOl.outerHTML = localStorage.savedShellOutputOl;

		outputSec.scrollTop = outputSec.scrollHeight;
	}
}
startLocalStorage();

// html tags as variables
const outputOl = document.getElementById("output-ol");
const submit = document.getElementById("submit-button");
submit.addEventListener("click", () => {
	parseInput(input.value);
	input.value = "";
	localStorage.savedShellInputValue = input.value;
});

const addButton = document.getElementById("add-button");
addButton.addEventListener("click", () => {
	const inputFile = document.createElement("input");
	inputFile.type = "file";
	inputFile.hidden = true;

	inputFile.addEventListener("change", (event) => {
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

const input = document.getElementById("input-box");
input.focus();
input.addEventListener("keydown", (event) => {
	switch (event.key) {
		case "Enter":
			parseInput(input.value);
			input.value = "";
			localStorage.savedShellInputValue = input.value;
			arrowUpIndex = -1
			break;
		case "ArrowUp":
			event.preventDefault();
			if (shellInputArray[arrowUpIndex + 1] !== undefined) {
				arrowUpIndex += 1;
				input.value = shellInputArray[arrowUpIndex];
			}
			localStorage.shellInputArray = shellInputArray;
			break;
		case "ArrowDown":
			event.preventDefault();
			if (shellInputArray[arrowUpIndex - 1] !== undefined) {
				arrowUpIndex -= 1;
				input.value = shellInputArray[arrowUpIndex];
			}
			localStorage.shellInputArray = shellInputArray;
			break;
	}
});

input.oninput = () => {
	autocomplete();
	localStorage.savedShellInputValue = input.value;
}

// important functions
async function renderMessage(sender, msgs) {
	if (sender != null) {
		const li = document.createElement("li");

		pfp = document.createElement("img");
		pfp.classList.add("pfp");
		if (sender === "user") {
			res = await fetch(`/fetchPFP?uuid=${localStorage.uuid}`);
			pfp.src = await res.text();
		} else if (sender === "caeborg") {
			pfp.src = "/assets/users/caeborg.avif";
		}
		li.appendChild(pfp);

		for (const msg of msgs) {
			if (typeof msg === "string") {
				const p = document.createElement("p");
				p.innerHTML = msg;
				li.appendChild(p);
			} else {
				li.appendChild(msg);
			}
		}
		outputOl.appendChild(li);
		localStorage.savedShellOutputOl = outputOl.outerHTML;
		document.getElementById("output-sec").scrollTop = document.getElementById("output-sec").scrollHeight;
	}
}

// main text parser and lexer
async function parseInput(text) {
	// init variables
	if (!text) return;
	renderMessage("user", [text]);
	shellInputArray.unshift(text);
	localStorage.shellInputArray = shellInputArray;
	const args = text.split(" ");
	const command = args.shift();
	// execute command
	if (command in commands) {
		const results = await commands[command].command(args); // do not remove async/await (important for fetch functions (e.g. nk()))
		if (results != null) renderMessage("caeborg", results);
		else console.log("Function return is null!")
	} else {
		// console.log(`Command ${command} not found`);
		renderMessage("caeborg", [ `<i>Command "${command}" not found</i>`] );
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
		brief: "Gives the structure of given IUPAC organic compound name",
		command: (args) => {
			// init
			const compound = args.join(" ");
			const url = `${chemUrl}/${compound}.png`;
			img = document.createElement("img");
			const response = httpGet(url);
			const text = response.responseText;
			if (response.status === 404) {
				const importantMessage = text.split("as follows:")[1];
				return [ importantMessage ];
			} else {
				img.src = url;
				img.classList.add("compound-img");
				return [ `IUPAC nomenclature for "${bi(compound)}":`, img ];
			}
		}
	},

	clear: {
		brief: "Clears the screen",
		command: () => {
			while (outputOl.firstChild) {
				outputOl.removeChild(outputOl.firstChild);
			}
			localStorage.savedShellOutputOl = outputOl.outerHTML;
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
			// 	let returnArray = [ bi(word + ":") ]
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
		command: async () => {
			dataJson = await fetch(`${lidwoordUrl}/appel`)
			dataJson = await response.json()
			return [ dataJson[0][0][0] ];
		}
	},

	help: {
		brief: "Lists all available commands",
		command: () => {
			let ret = bi("Welcome to CShell! This is a text interface that offers different tools.<br>Here are the available commands:<br>");
			for (const [k, v] of Object.entries(commands)) {
				ret += `${bi(k)}: ${v.brief};<br>`;
			}
			return [ ret ];
		}
	},

	nk: {
		brief: "Returns physics formulas. `list` for list of available arguments",
		command: async (args) => {
			nkJSON = await fetch(`/assets/physics.json`);
			nkJSON = await nkJSON.json();
			if (args[0] !== "list") {
				const array = nkJSON[args[0]];
				const baseFormula = array[0];
				const definitions = array[1].join("<br>");

				if (args[0] === "list") {
					return [object.keys(nkJSON).join("<br>")];
				} else {
					console.log("were here!");
					return [
						`base formula for ${bi(args[0])}:<br> ${bi(baseFormula)}`,
						`contextual definitions:<br> ${bi(definitions)}`
					];
				}
			} else {
				const all = Object.keys(nkJSON);
				let brief = []
				for ([key, value] of Object.entries(nkJSON)) {
					brief.push(`${key}: ${bi(value[0])}`);
				}
				return [ `${brief.join("<br>")}` ];
			}
		}
	},

	ping: {
		brief: "Ping user back",
		command: () => {
			return ["pong!"];
		}
	},

}

if (shouldHelp === true) {
	renderMessage("caeborg", commands["help"].command());
}

function bi(str) {
	return `<b><i>${str}</i></b>`;
}

function ascii(img) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	context.drawImage(img, 0, 0);
	const arr = context.getImageData(0, 0, img.width, img.height).data;

	for (let i = 0; i < arr.length; i += 4) {
		const red = arr[i];
		const green = arr[i + 1];
		const blue = arr[i + 2];
		const alpha = arr[i + 3];
		console.log(red, green, blue, alpha);
	}
}
