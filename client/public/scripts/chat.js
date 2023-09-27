// P R E R E Q U I S I T E S
// import { ourUrl } from '../env.js'
const ourUrl = 'http://localhost:8000'

// C O N S T A N T S
const lidwoordUrl = "https://welklidwoord.nl";
const chemUrl = "https://opsin.ch.cam.ac.uk/opsin";
const urbandictUrl = "https://api.urbandictionary.com/v0/define?term=";

let input_array = localStorage.getItem('input_array');
if (input_array === null || typeof input_array === 'string') input_array = [];
let arrowup_index = -1

// Starting localStorage values
function startLocalStorage() {
    const output_sec = document.getElementById('output-sec');
    const output_ol = document.createElement('ol');
    if (localStorage.getItem('saved_chat_output_ol') === null) {
        output_ol.id = 'output-ol';
        output_sec.appendChild(output_ol);
    } else {
        output_sec.appendChild(output_ol);
        output_ol.outerHTML = localStorage.getItem('saved_chat_output_ol');

        output_sec.scrollTop = output_sec.scrollHeight;
    }
}
startLocalStorage();

// html tags as variables
const output_list = document.getElementById('output-ol');
const submit = document.getElementById('submit-button');
submit.addEventListener('click', () => {
    parseInput(input.value);
    input.value = '';
    localStorage.setItem('saved_chat_input_value', input.value);
});

const input = document.getElementById('input-box');
input.focus();
input.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'Enter':
            parseInput(input.value);
            input.value = "";
            localStorage.setItem('saved_chat_input_value', input.value);
            arrowup_index = -1
            break;
        case 'ArrowUp':
            if (input_array[arrowup_index + 1] !== undefined) {
                arrowup_index += 1;
                input.value = input_array[arrowup_index];
            }
            localStorage.setItem('input_array', input_array)
            break;
        case 'ArrowDown':
            if (input_array[arrowup_index - 1] !== undefined) {
                arrowup_index -= 1;
                input.value = input_array[arrowup_index];
            }
            localStorage.setItem('input_array', input_array)
            break;
    }
});

input.oninput = () => {
    autocomplete();
    localStorage.setItem('saved_chat_input_value', input.value);
}

// important functions

function send(sender, msgs) {
    if (sender != null) {
        const li = document.createElement('li');

        pfp = document.createElement('img');
        pfp.classList.add(`sender-is-${sender}`, 'pfp');
        pfp.src = `${ourUrl}/assets/${sender}.png`;
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
        output_list.appendChild(li);
        localStorage.setItem('saved_chat_output_ol', output_list.outerHTML);
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

// main text parser and lexer

async function parseInput(text) {
    // init variables
    send('user', [text]);
    input_array.unshift(text);
    localStorage.setItem('input_array', input_array);
    const args = text.split(' ');
    const command = args.shift();
    if (command === "") {
        return;
    }
    // execute command
    if (command in commands) {
        const results = await commands[command].command(args); // do not remove async/await (important for fetch functions (e.g. nk()))
        if (results != null) send('caeborg', results);
        else console.log('Function return is null!')
    } else {
        // console.log(`Command ${command} not found`);
        send('caeborg', [ `<i>Command '${command}' not found</i>`] );
    }
    document.getElementById('output-sec').scrollTop = document.getElementById('output-sec').scrollHeight;
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
            while(output_list.firstChild) {
                output_list.removeChild(output_list.firstChild);
            }
            localStorage.setItem('saved_chat_output_ol', output_list.outerHTML);
            return null;
        }
    },

    define: {
        brief: "Gives you the correct definition of the word",
        command: async function(args) {
            const term = args[0];
            const url = urbandictUrl + term;
            const response = await fetch(url);
            const js = await response.json();
            alert(js);
        }
    },

    deofhet: {
        brief: "Gives you the article of given Dutch word - <i>de</i> or <i>het</i>",
        command: async (event) => {
            const url = lidwoordUrl + "/appel";
            let response = await fetch(url)
            .then(response => response.json())
            .then(data_json => {
                return data_json[0][0][0];
            })
            console.log(response);
            return [response];
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
        command: (args) => {
            return fetch(`${ourUrl}/assets/physics.json`)
                .then(result => result.json())
                .then(nk_json => {
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
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                    return [`${error}`];
                })

            }
    },

    ping: {
        brief: 'Ping user back',
        command: (args) => {
            return ["pong!"];
        }
    },

}

// Other functions
function bi(str) {
    return `<b><i>${str}</i></b>`
}

function log(args) {
    console.log(args);
    // lololol kys
}
