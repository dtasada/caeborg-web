// P R E R E Q U I S I T E S
time = new Date();

const ws = new WebSocket(`wss://${document.location.host}/chatSocket`);
ws.addEventListener("open", () => {
	console.log("Websocket connected");
	ws.send(JSON.stringify({ type: "chatFetchAll" }));
});

ws.addEventListener("message", ({ data }) => {
	const json = JSON.parse(data);

	switch (json.type) {
		case "chatJSON":
			for (value of Object.values(json)) {
				if (value !== "chatJSON") renderMessage(value);
			}
		break;
		case "chatPostMessage":
			renderMessage(json);
		break;
	}
});

// html tags as variables
const input = document.getElementById('input-box');
const addButton = document.getElementById('add-button');
const submit = document.getElementById('submit-button');
const outputSec = document.getElementById('output-sec');
const outputOl = document.getElementById('output-ol');
if (!localStorage.uuid) {
	input.setAttribute("placeholder", "please sign in to use chat")
	input.setAttribute("disabled", true)
	submit.setAttribute("disabled", true)
	addButton.setAttribute("disabled", true)
}

input.focus();
input.addEventListener('keydown', event => {
	switch (event.key) {
		case 'Enter':
			parseInput(input.value);
			input.value = "";
			localStorage.savedChatInputValue = input.value;
		break;
	}
});

input.oninput = () => { localStorage.savedChatInputValue = input.value; }

submit.addEventListener('click', () => {
	parseInput(input.value);
	input.value = '';
	localStorage.savedChatInputValue = input.value;
});

function zeroPad(txt) {
	if (txt.length === 1) return `0${txt}`
	else if (txt.length === 2) return txt
	else return "idk"
}

// Handle images
addButton.addEventListener('click', () => {
	const inputFile = document.createElement('input');
	inputFile.type = "file";
	inputFile.hidden = true;

	inputFile.addEventListener("change", (event) => {
		const file = event.target.files[0];
		if (file) {
			reader = new FileReader();
			reader.onload = () => {
				// Send to server
				ws.send(JSON.stringify({
					content: `${reader.result}`,
					sender: localStorage.uuid,
					date: `${time.toLocaleDateString()}`,
					time: `${zeroPad(time.getHours())}:${zeroPad(time.getMinutes())}`,
					dataType: "img",
					type: "chatPostMessage"
				}));
			};
			reader.readAsDataURL(file);
		}
	});
	inputFile.click();
});

// important functions
async function renderMessage(json) {
	// render html message
	const li = document.createElement("li");

	const pfp = document.createElement("img");
	pfp.classList.add("pfp");
	res = await fetch(`/fetchPFP?username=${json.sender}`);
	pfp.src = await res.text();
	pfp.alt = `${json.sender}'s pfp`;
	li.appendChild(pfp);

	const senderP = document.createElement("p");
	senderP.innerHTML = json.sender;
	senderP.classList.add("usernameTag");
	li.appendChild(senderP);

	const timedateP = document.createElement("p");
	if (json.date === time.toLocaleDateString()) json.date = "Today";
	if (json.time === `${zeroPad(time.getHours())}:${zeroPad(time.getMinutes())}`) {
		timedateP.innerHTML = "&ensp;now";
	} else {
		timedateP.innerHTML = `&ensp;${json.date} at ${json.time}`;
	}
	timedateP.classList.add("datetimeTag");
	li.appendChild(timedateP);

	if (json.dataType === "txt") {
		const p = document.createElement("p");
		p.classList.add("messageContent")
		p.innerHTML = json.content;
		p.innerHTML = p.innerHTML.replace(/http\S+/, '<a href="$&" target="_blank">$&</a>');
		li.appendChild(p);
	} else if (json.dataType === "img") {
		img = document.createElement("img");
		img.src = json.content;
		img.classList.add("imageMessage");
		li.appendChild(img);
	}

	outputOl.appendChild(li);
	outputSec.scrollTop = 2 * outputSec.scrollHeight;
}

// Handle text
async function parseInput(text) {
	if (text !== "") {
		ws.send(JSON.stringify({
			content: text,
			sender: localStorage.uuid,
			date: `${time.toLocaleDateString()}`,
			time: `${zeroPad(time.getHours())}:${zeroPad(time.getMinutes())}`,
			dataType: "txt",
			type: "chatPostMessage"
		}));
	}
}
