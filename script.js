// P R E R E Q U I S I T E S


// C O N S T A N T S
const lidwoord_url = "https://welklidwoord.nl/banaan";
console.log(get(lidwoord_url));

// H T M L  T A G S  A S  V A R I A B L E S
var input = document.getElementById("input-box");
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    parseInput(input.value);
    input.value = "";
  }
});

const output_list = document.getElementById("output-list");

// M A I N  T E X T  P A R S E R  A N D  L E X E R

var output = [];

function parseInput(text) {
  // init variables
  output.push(text);
  console.log(output[0])
  let args = text.split(" ");
  let command = args.shift();
  // execute command
  if (command in commands) {
    output.push(commands[command].command(args));
    console.log(output[0]);
    console.log(`Command ${command} is found`);
  } else {
    console.log(`Command ${command} not found`);
  }
}

// S T R U C T  O F  F U N C T I O N S
const commands = {
  help: {
    brief: "The help function",
    command: (args) => {
        console.log(args);
		send("asdasd");
    }
  },

  clear: {
    brief: "Clears the screen",
    command: () => {
      var clear = true
    }
  },

  deofhet: {
    brief: "Prints pronoun of word",
    command: (args) => {
      let content = axios.get("https://jsonplaceholder.typicode.com/posts/1")
      let data = content.then((response) => response.data)
      // let content = axios.get(`${lidwoord_url}${args[0]}`)
      console.log(data)
      console.log(content)
      return(`_${content.data(`In de Nederlandse taal gebruiken wij (.*?) ${args[0]}`, content).group(1)}_ ${noun}`)
    }
  }

}

// I M P O R T A N T  F U N C T I O N S

function send(txt) {
	const li = document.createElement("li");
	const node = document.createTextNode(txt);
	li.appendChild(node);
	output_list.appendChild(li);
}

async function get(url) {
	let headers = new Headers();
	const response = await fetch(url);
	const jsonData = await response.json();
	return jsonData;
}
