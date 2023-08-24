// P R E R E Q U I S I T E S

// C O N S T A N T S
const lidwoordUrl = "https://welklidwoord.nl/banaan";
const chemUrl = "https://opsin.ch.cam.ac.uk/opsin";
const ourURL = "http://localhost:8000"

// H T M L  T A G S  A S  V A R I A B L E S
var submit = document.getElementById("submit-button");
submit.addEventListener("click", () => {
  parseInput(input.value);
	sumbit.value = "";
});

var input = document.getElementById("input-box");
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    parseInput(input.value);
		input.value = "";
  }
});

const ordered_list = document.getElementById("output-text");

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
			// console.log(`Type: '${msg_type}', Content: '${msg_content}'`);

			if (msg_type == "text" ) {
				const p = document.createElement('p');
				p.innerHTML = msg_content;
				li.appendChild(p);
			}
			else if (msg_type == "image") {
				li.appendChild(msg_content);
			};
		}
		ordered_list.appendChild(li);
	}
}

// M A I N  T E X T  P A R S E R  A N D  L E X E R

var output = [];

function parseInput(text) {
  // init variables
  output.push(text);
	send("user", [["text", text]]);
  let args = text.split(" ");
  let command = args.shift();
  // execute command
  if (command in commands) {
		let results = commands[command].function(args);
		if (results != null) { send("caeborg", results); }
    output.push(results);
    // console.log(`Command ${command} is found`);
		// console.log(results);

  } else {
    console.log(`Command ${command} not found`);
    send("caeborg", [["text", `<i>Command '${command}' not found</i>`]]);
  }
}

// S T R U C T  O F  F U N C T I O N S
const commands = {
  help: {
    brief: "The help function",
    function: (args) => {
				return [ "caeborg", ["text", `${commands}`] ];
    }
  },

  clear: {
    brief: "Clears the screen",
    function: () => {
      while(ordered_list.firstChild) {
        ordered_list.removeChild(ordered_list.firstChild);
      };
			return null;
    }
  },

	ping: {
		brief: "Ping user back",
		function: (args) => {
			return Array(args[0]).fill(["text", "pong!"]);
			// return [["text", "pong!"], ["text", "pong!"]]
		}
	},

  chem: {
    brief: "Gives the structure of given IUPAC organic compound name",
    function: (args) => {
      // init
      let compound = args.join(" ");
      let url = `${chemUrl}/${compound}.png`;
      img = document.createElement("img");
      img.src = url;
      img.id = "compound-img"; // this should prolly be a class rather than an id pls
      // sending
			return [["text", `IUPAC nomenclature for '<b><i>${compound}</i></b>':`], ["image", img]];
    }
  }

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

