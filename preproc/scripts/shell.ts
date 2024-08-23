export { };
const inputBox = document.getElementById("input-box")! as HTMLInputElement;
const addButton = document.getElementById("add-button")! as HTMLButtonElement;
const submit = document.getElementById("submit-button")! as HTMLButtonElement;
const outputOl = document.getElementById("output-ol")!;

function scrollBottom() {
	document.getElementById("output-sec")!.scroll({
		top: outputOl.scrollHeight,
		behavior: "smooth"
	});
}

// Constants
const chemUrl = "https://opsin.ch.cam.ac.uk/opsin";
let shellInputArray: string[] = localStorage.shellInputArray;
if (!shellInputArray || typeof shellInputArray === "string") shellInputArray = [];
let arrowUpIndex = -1;
let shouldHelp = false;

// Starting localStorage values
if (!localStorage.savedOutputOl) {
	shouldHelp = true;
} else {
	outputOl.outerHTML = localStorage.savedOutputOl;
	scrollBottom();
}

// html tags as variables
submit.addEventListener("click", () => {
	parseInput(inputBox.value);
	inputBox.value = "";
	localStorage.savedInputValue = inputBox.value;
});

addButton.addEventListener("click", () => {
	const inputFile = document.createElement("input");
	inputFile.type = "file";
	inputFile.hidden = true;

	inputFile.addEventListener("change", (event) => {
		const file = (event.target as HTMLInputElement).files![0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const img = document.createElement("img") as HTMLImageElement;
				img.src = e.target!.result as string;
				img.alt = file.name;
				inputFile.removeAttribute("value");
				ascii(img)
			};
			reader.readAsDataURL(file);
		}
	});

	inputFile.click();
})

inputBox.focus();
inputBox.addEventListener("keydown", (event) => {
	switch (event.key) {
		case "Enter":
			parseInput(inputBox.value);
			inputBox.value = "";
			localStorage.savedInputValue = inputBox.value;
			arrowUpIndex = -1
			break;
		case "ArrowUp":
			event.preventDefault();
			if (shellInputArray[arrowUpIndex + 1] !== undefined) {
				arrowUpIndex += 1;
				inputBox.value = shellInputArray[arrowUpIndex];
			}
			localStorage.shellInputArray = shellInputArray;
			break;
		case "ArrowDown":
			event.preventDefault();
			if (shellInputArray[arrowUpIndex - 1] !== undefined) {
				arrowUpIndex -= 1;
				inputBox.value = shellInputArray[arrowUpIndex];
			}
			localStorage.shellInputArray = shellInputArray;
			break;
	}
});

inputBox.oninput = () => {
	localStorage.savedInputValue = inputBox.value;
}

// important functions
async function renderMessage(sender: string, msgs: string[]) {
	if (sender != null) {
		const li = document.createElement("li");

		const pfp = document.createElement("img") as HTMLImageElement;
		pfp.classList.add("pfp");
		if (sender === "user") {
			const res = await fetch(`/fetchPFP?uuid=${localStorage.uuid}`);
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
		localStorage.savedOutputOl = outputOl.outerHTML;
		scrollBottom();
	}
}

// main text parser and lexer
async function parseInput(text: string) {
	// init variables
	if (!text) return;
	renderMessage("user", [text]);
	shellInputArray.unshift(text);
	localStorage.shellInputArray = shellInputArray;
	const args = text.split(" ");
	const command = args.shift()!;
	// execute command
	if (command in commands) {
		const results = commands[command].command(args); // do not remove async/await (important for fetch functions (e.g. nk()))
		if (results != null) renderMessage("caeborg", results);
		else console.log("Function return is null!")
	} else {
		// console.log(`Command ${command} not found`);
		renderMessage("caeborg", [`<i>Command "${command}" not found</i>`]);
	}
}

function httpGet(theUrl: string) {
	const xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false);
	xmlHttp.send(null);
	return xmlHttp;
}

// dict of functions
interface Command {
	brief: string,
	command: (args: string[]) => any[],
}
const commands: Record<string, Command> = {
	chem: {
		brief: "Gives the structure of given IUPAC organic compound name",
		command: (args: string[]) => {
			// init
			const compound = args.join(" ");
			const url = `${chemUrl}/${compound}.png`;
			const img = document.createElement("img") as HTMLImageElement;
			const response = httpGet(url);
			const text = response.responseText;
			if (response.status === 404) {
				const importantMessage = text.split("as follows:")[1];
				return [importantMessage];
			} else {
				img.src = url;
				img.classList.add("compound-img");
				return [`IUPAC nomenclature for "${bi(compound)}":`, img];
			}
		}
	},

	clear: {
		brief: "Clears the screen",
		command: () => {
			while (outputOl.firstChild) {
				outputOl.removeChild(outputOl.firstChild);
			}
			localStorage.savedOutputOl = outputOl.outerHTML;
			return [null];
		}
	},

	/* define: {
		brief: "Gives you the correct definition of the word",
		command: async function(args) {
			const term = args[0];
			const url = urbandictUrl + term;
			const response = await fetch(url);
			const js = await response.json();
			alert(js);
		}
	}, */

	/* dict: {
		brief: "Gives word definitions from <i>dictionaryapi.dev</i>",
		command: (args: string[]) => {
			let command = null;
			for (const i in args) {
				if (["--synonyms", "--antonyms", "--full"].includes(args[i])) {
					command = args[i];
					args.splice(i, 1);
				}
			}
			const word = args[args.length - 1];
			const res = fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
			const dataJSON = await res.json();
			console.log(JSON.stringify(dataJson, "<br>", "\t"))
			if (command === "--full") return [ JSON.stringify(dataJson) ]
			else {
				let returnArray = [ bi(word + ":") ]
				for (index of Object.values(dataJson)) {
					for (key of Object.keys(index)) {
						value = index[property];
						if (key === "meanings") {
							for (meaning in key) {

							}
						}
					}
				}
				// return
			}
			return [ null ];
		},
	}, */

	/* deofhet: {
		brief: "Gives you the article of given Dutch word - <i>de</i> or <i>het</i>",
		command: () => {
			return fetch(`${lidwoordUrl}/appel`)
				.then(res => res.json())
				.then(resJSON => { return [null] })
		}
	}, */

	help: {
		brief: "Lists all available commands",
		command: () => {
			let ret = bi("Welcome to C This is a text interface that offers different tools.<br>Here are the available commands:<br>");
			for (const [k, v] of Object.entries(commands)) {
				ret += `${bi(k)}: ${v.brief};<br>`;
			}
			return [ret];
		}
	},

	nk: {
		brief: "Returns physics formulas. `list` for list of available arguments",
		command: (args: string[]) => {
			let ret!: string[];
			fetch("/assets/physics.json")
				.then(res => res.json())
				.then(nkJSON => {
					if (args[0] !== "list") {
						const array = nkJSON[args[0]];
						const baseFormula = array[0];
						const definitions = array[1].join("<br>");

						if (args[0] === "list") {
							ret = [Object.keys(nkJSON).join("<br>")];
						} else {
							ret = [
								`base formula for ${bi(args[0])}:<br> ${bi(baseFormula)}`,
								`contextual definitions:<br> ${bi(definitions)}`
							];
						}
					} else {
						// const all = Object.keys(nkJSON);
						let brief: string[] = [];
						for (const [key, value] of Object.entries<any[]>(nkJSON)) {
							brief.push(`${key}: ${bi(value[0])}`);
						}
						ret = [`${brief.join("<br>")}`];
					}
				});
			return ret;
		}
	},

	ping: {
		brief: "Ping user back",
		command: () => {
			return ["pong!"];
		}
	},

}

if (shouldHelp) {
	renderMessage("caeborg", commands["help"].command([""]));
}

function bi(str: string) {
	return `<b><i>${str}</i></b>`;
}

function ascii(img: HTMLImageElement) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d")!;
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
