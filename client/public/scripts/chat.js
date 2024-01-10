// P R E R E Q U I S I T E S
time = new Date();

const uuid = localStorage.uuid;

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
if (!localStorage.uuid) {
	input.setAttribute("disabled", true)
	input.setAttribute("placeholder", "please sign in to use chat")
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

const outputSec = document.getElementById('output-sec');
const outputOl = document.getElementById('output-ol');
const submit = document.getElementById('submit-button');
submit.addEventListener('click', () => {
	parseInput(input.value);
	input.value = '';
	localStorage.savedChatInputValue = input.value;
});

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
				console.log(`${reader.result}`)
				ws.send(JSON.stringify({
					content: `${reader.result}`,
					sender: uuid,
					date: `${time.toLocaleDateString()}`,
					time: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
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

	pfp = document.createElement("img");
	pfp.classList.add("pfp");
	pfp.src = `/icon?url=${json.sender}&size=64..128..256`
	pfp.alt = `${json.sender}'s profile picture`
	li.appendChild(pfp);

	const senderP = document.createElement("p");
	senderP.innerHTML = json.sender;
	senderP.classList.add("usernameTag");
	li.appendChild(senderP);

	const timedateP = document.createElement("p");
	if (json.date === time.toLocaleDateString()) json.date = "Today";
	if (json.time === `${time.getHours()}:${time.getMinutes()}`) {
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
			sender: uuid,
			date: `${time.toLocaleDateString()}`,
			time: `${time.getHours()}:${time.getMinutes()}`,
			dataType: "txt",
			type: "chatPostMessage"
		}));
	}
}
