// P R E R E Q U I S I T E S
// import { ourUrl } from '../env.js'
const ourUrl = 'http://localhost:8000'

// C O N S T A N T S
const lidwoordUrl = "https://welklidwoord.nl/banaan";
const chemUrl = "https://opsin.ch.cam.ac.uk/opsin";

// Starting localStorage values
if (localStorage.getItem('saved_chat_output_list') === null) {
    const ol = document.createElement('ol')
    ol.id = 'output-ol'
    document.getElementById('output-sec').appendChild(ol);
} else {
    const output_list = localStorage.getItem('saved_chat_output_list');
    const parser = new DOMParser()
    const ol = parser.parseFromString(output_list, 'text/html');
    document.getElementById('output-sec').appendChild(ol.documentElement);
}

// H T M L  T A G S  A S  V A R I A B L E S
const submit = document.getElementById("submit-button");
submit.addEventListener("click", () => {
    parseInput(input.value);
    input.value = "";
    localStorage.setItem('saved_chat_input_value', input.value);
});

const input = document.getElementById("input-box");
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        parseInput(input.value);
        input.value = "";
        localStorage.setItem('saved_chat_input_value', input.value);
    }
});

input.oninput = () => {
    autocomplete();
    localStorage.setItem('saved_chat_input_value', input.value);
}


const output_list = document.getElementById("output-ol");

// I M P O R T A N T  F U N C T I O N S
function send(sender, msgs) {
    if (sender != null) {
        const li = document.createElement('li');

        pfp = document.createElement("img");
        pfp.classList.add(`sender-is-${sender}`, 'pfp');
        pfp.src = `${ourUrl}/assets/${sender}.png`;
        li.appendChild(pfp);

        for (msg of msgs) {
            const msg_type = msg[0];
            const msg_content = msg[1];

            if (msg_type === "text" ) {
                const p = document.createElement('p');
                p.innerHTML = msg_content;
                li.appendChild(p);
            }
            else if (msg_type === "image") {
                li.appendChild(msg_content);
            }
        }
        output_list.appendChild(li);
        localStorage.setItem('saved_chat_output_list', output_list.outerHTML);
    }
}

function autocomplete() {
    for (command in commands) {
        if (command.includes(input.value)) {
            const i = command.indexOf(input);
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

function parseInput(text) {
    // init variables
    send("user", [["text", text]]);
    const args = text.split(" ");
    const command = args.shift();
    // execute command
    if (command in commands) {
        const results = commands[command].command(args);
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
                output_list.removeChild(output_list.firstChild);
            }
            localStorage.setItem('saved_chat_output_list', output_list.outerHTML);
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
            const compound = args.join(" ");
            const url = `${chemUrl}/${compound}.png`;
            img = document.createElement("img");
            const response = httpGet(url);
            const text = response.responseText;
            if (response.status === 404) {
                const importantMessage = text.split("as follows:")[1];
                return [["text", importantMessage]];
            } else {
                img.src = url;
                img.classList.add("compound-img");
                return [["text", `IUPAC nomenclature for '<b><i>${compound}</i></b>':`], ["image", img]];
            }
        }
    },

    nk: {
        brief: "Returns physics formulas. `list` for list of available arguments",
        command: (args) => {
            fetch(`${ourUrl}/assets/physics.json`)
                .then(response => response.json())
                .then(nk_json => {
                    const array = nk_json[args[0]];
                    const base_formula = array[0];
                    const definitions = array[1].join('<br>');

                    if (args[0] === "list") {
                        return [["text", Object.keys(nk_json).join('<br>')]];
                    } else {
                        console.log(`Contextual definitions: ${definitions}`);
                        console.log(`Base formula for <b><i>${args}</i></b>: ${base_formula}`);
                        return [
                            ["text", `Base formula for <b><i>${args}</i></b>: ${base_formula}`],
                            ["text", `Contextual definitions: ${definitions}`]
                        ];
                    }
                });

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
