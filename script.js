// Require libraries
// const axios = import('axios');

// Define constants
const lidwoord_url = "https://welklidwoord.nl/"

// initialize text input
var input = document.getElementById("input-box");
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    parseInput(input.value);
    input.value = "";
  }
});

// the main input parser for the program
function parseInput(text) {
  // init variables+
  let args = text.split(" ");
  let command = args.shift();
  // execute command
  if (command in commands) {
    commands[command].command(args);
    console.log(`Command ${command} is found`);
  } else {
    console.log(`Command ${command} not found`);
  }
}

// all the commands stored in a struct
const commands = {
  help: {
    brief: "The help function",
    command: (args) => {
        console.log(args);
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

// console.log(commands["deofhet"].command("huis"))
