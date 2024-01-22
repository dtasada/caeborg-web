// P R E R E Q U I S I T E S
time = new Date();

const ws = new WebSocket(`wss://${document.location.host}/chatSocket`);
ws.addEventListener("open", () => {
	console.log("Websocket connected");
	ws.send(JSON.stringify({ type: "chatFetchAll" }));
});

ws.addEventListener("message", async ({ data }) => {
	const json = JSON.parse(data);

	if (json.type === "chatPostMessage") {
			await renderMessage(json);
	} else {
		for (value of Object.values(json)) {
			await renderMessage(value);
		}
	}
});

// html tags as variables
const input = document.getElementById("input-box");
const addButton = document.getElementById("add-button");
const submit = document.getElementById("submit-button");
const outputSec = document.getElementById("output-sec");
const outputOl = document.getElementById("output-ol");
console.log(localStorage.uuid);
if (!localStorage.uuid) {
	input.placeholder = "please sign in to use chat";
	input.disabled = true;
	submit.disabled = true;
	addButton.disabled = true;
}

input.focus();
input.addEventListener("keydown", event => {
	switch (event.key) {
		case "Enter":
			parseInput(input.value);
			input.value = "";
			localStorage.savedChatInputValue = input.value;
		break;
	}
});

input.oninput = () => { localStorage.savedChatInputValue = input.value; }

submit.addEventListener("click", () => {
	parseInput(input.value);
	input.value = "";
	localStorage.savedChatInputValue = input.value;
});

function getTime() {
	let hour = time.getHours().toString();
	let minute = time.getMinutes().toString();
	if (hour.length === 1) hour = "0" + hour
	if (minute.length === 1) minute = "0" + minute

	return `${hour}:${minute}`;
}

// Handle images
addButton.addEventListener("click", () => {
	const inputFile = document.createElement("input");
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
					time: getTime(),
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
	if (json.time === getTime()) {
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
		if (p.innerHTML.includes("@")) {
			const user = p.innerHTML.match(/@\S+/)[0].split("@")[1];
			let pingsMe = await fetch(`/pingUser`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: user,
					uuid: localStorage.uuid
				})
			});
			pingsMe = await pingsMe.text();
			p.innerHTML = p.innerHTML.replace(/@\S+/, `<p class="ping">$&</p>`);
			if (pingsMe === "true") li.classList.add("pingsMe");
		}
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
			time: getTime(),
			dataType: "txt",
			type: "chatPostMessage"
		}));
	}
}
