// initialize text input
var input = document.getElementById("input");
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
  }
}
