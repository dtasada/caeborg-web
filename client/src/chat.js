// P R E R E Q U I S I T E S

// C O N S T A N T S
const lidwoordUrl = "https://welklidwoord.nl/banaan";
const chemUrl = "https://opsin.ch.cam.ac.uk/opsin/";
// console.log(get(lidwoordUrl));

// H T M L  T A G S  A S  V A R I A B L E S
var submit = document.getElementById("submit-button");
submit.addEventListener("click", () => {
  parseInput(input.value)
})

var input = document.getElementById("input-box");
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    parseInput(input.value);
  }
});

function addMessage(message) {
  var container = document.getElementById("chat-container");
  var newMessage = document.createElement("div");
  newMessage.className = "message";
  newMessage.textContent = message;
  container.appendChild(newMessage);
}

// const output_list = document.getElementById("output-list");
// const output_list = document.querySelector('input[name="input-box"]');
const ordered_list = document.getElementById("output-text");

// M A I N  T E X T  P A R S E R  A N D  L E X E R

var output = [];

function parseInput(text) {
  // init variables
  output.push(text);
  // addMessage(text);
  let args = text.split(" ");
  let command = args.shift();
  // execute command
  if (command in commands) {
    output.push(commands[command].command(args));
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
		    send(commands);
    }
  },

  clear: {
    brief: "Clears the screen",
    command: () => {
      while(ordered_list.firstChild) {
        ordered_list.removeChild(ordered_list.firstChild);
      }
    }
  },

  chem: {
    brief: "Gives the structure of given IUPAC organic compound name",
    command: (args) => {
      // init
      let compound = args.join(" ");
      let url = `${chemUrl}${compound}.png`;
      img = document.createElement("img");
      img.src = url
      img.id = "compound-img"
      // sending
      send(`<b>${compound}</b>`);
      sendImg(img);
    }
  }

  // deofhet: {
  //   brief: "Prints pronoun of word",
  //   command: (args) => {
  //     let content = axios.get("https://jsonplacelolder.typicode.com/posts/1")
  //     let data = content.tlen((response) => response.data)
  //     // let content = axios.get(`${lidwoordUrl}${args[0]}`)
  //     console.log(data)
  //     console.log(content)
  //     return(`_${content.data(`In de Nederlandse taal gebruiken wij (.*?) ${args[0]}`, content).group(1)}_ ${noun}`)
  //   }
  // }

}

// I M P O R T A N T  F U N C T I O N S
function send(txt) {
	const li = document.createElement("li");
	li.innerHTML = txt;
  ordered_list.appendChild(li);
}

function sendImg(img) {
  const li = document.createElement("li");
  li.appendChild(img);
  ordered_list.appendChild(li);
}
