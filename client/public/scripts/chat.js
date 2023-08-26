// P R E R E Q U I S I T E S

// C O N S T A N T S
const lidwoordUrl = "https://welklidwoord.nl/banaan";
const chemUrl = "https://opsin.ch.cam.ac.uk/opsin";
const ourURL = "http://localhost:8000"

// Starting localStorage values
if (localStorage.getItem('saved_chat_output_list') === null) {
	let ol = document.createElement('ol')
	ol.id = 'output-ol'
	document.getElementById('output-sec').appendChild(ol);
} else {
	let ol = (new DOMParser()).parseFromString(localStorage.getItem('saved_chat_output_list'), 'text/html')
	document.getElementById('output-sec').appendChild(ol.documentElement);
}

// H T M L  T A G S  A S  V A R I A B L E S
var submit = document.getElementById("submit-button");
submit.addEventListener("click", () => {
  parseInput(input.value);
	sumbit.value = "";
});

var input = document.getElementById("input-box");
input.oninput = () => {
	localStorage.setItem('saved_chat_input_value', input.value);
	autocomplete();
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    parseInput(input.value);
		input.value = "";
  }
});

const output_list = document.getElementById("output-ol");

// I M P O R T A N T  F U N C T I O N S
function send(sender, msgs) {
	if (sender != null) {
		const li = document.createElement('li');

		pfp = document.createElement("img");
		pfp.classList.add(`sender-is-${sender}`, 'pfp');
		pfp.src = `${ourURL}/assets/${sender}.png`;
		li.appendChild(pfp);

		for (msg of msgs) {
			let msg_type = msg[0];
			let msg_content = msg[1];

			if (msg_type == "text" ) {
				const p = document.createElement('p');
				p.innerHTML = msg_content;
				li.appendChild(p);
			}
			else if (msg_type == "image") {
				li.appendChild(msg_content);
			};
		}
		output_list.appendChild(li);
		localStorage.setItem('saved_chat_output_list', output_list.outerHTML);
		console.log(output_list);
	}
}

function autocomplete() {
	for (command in commands) {
		if (command.includes(input.value)) {
			let i = command.indexOf(input);

			if (i === -1) {
  			const validlenofinput = input.length;
				console.log(`${input.value} is found in ${command}`);
			} else {
				console.log(`${input.value} is not found in ${command}`);
			}
		}
	}
} // https://codepen.io/dwidomski/pen/OWOBdr

function httpGet(theUrl) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp;
}

// M A I N  T E X T  P A R S E R  A N D  L E X E R

var output = [];

function parseInput(text) {
  // init variables
	send("user", [["text", text]]);
  let args = text.split(" ");
  let command = args.shift();
  // execute command
  if (command in commands) {
		let results = commands[command].command(args);
		if (results != null) { send("caeborg", results); }
  } else {
    console.log(`Command ${command} not found`);
    send("caeborg", [["text", `<i>Command '${command}' not found</i>`]]);
  }
}

// S T R U C T  O F  F U N C T I O N S
const commands = {
  help: {
    brief: "The help function",
    command: (args) => {
				return [ "caeborg", ["text", `${commands}`] ];
    }
  },

  clear: {
    brief: "Clears the screen",
    command: () => {
      while(output_list.firstChild) {
        output_list.removeChild(ordered_list.firstChild);
      };
			return null;
    }
  },

	ping: {
		brief: "Ping user back",
		command: (args) => {
			return [["text", "pong!"]]
		}
	},

  chem: {
    brief: "Gives the structure of given IUPAC organic compound name",
    command: (args) => {
      // init
      let compound = args.join(" ");
      let url = `${chemUrl}/${compound}.png`;
      img = document.createElement("img");
	    let response = httpGet(url);
	    let text = response.responseText;
	    if (response.status === 404) {
				let importantMessage = text.split("as follows:")[1];
				return [["text", importantMessage]];
	    } else {
				img.src = url;
				img.classList.add("compound-img");
				return [["text", `IUPAC nomenclature for '<b><i>${compound}</i></b>':`], ["image", img]];
	    }
    }
  },

	// nk: {
	// 	brief: "Returns physics formulas. `list` for list of available arguments",
	// 	command: (args) => {
	// 		import nk_json from '../assets/physics.json';
	// 		formulas(Object.keys(nk_json));
	// 		
	// 		if (args[0] == "list") {
	// 			return [["text", formulas]];
	// 		} else {
	// 			let value = nk[arg];
	// 		}
	// 	}
	// },

/*
  deofhet: {
	  brief: "Prints pronoun of word",
	  function: (args) => {
	    let content = axios.get("https://jsonplacelolder.typicode.com/posts/1")
	    let data = content.tlen((response) => response.data)
	    // let content = axios.get(`${lidwoordUrl}${args[0]}`)
	    console.log(data)
	    console.log(content)
	    return(`_${content.data(`In de Nederlandse taal gebruiken wij (.*?) ${args[0]}`, content).group(1)}_ ${noun}`)
	  }
  }
*/

}

