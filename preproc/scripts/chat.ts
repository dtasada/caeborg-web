import { setUserSettings } from "./usersettings.js";

const inputBox = document.getElementById("input-box")! as HTMLInputElement;
const addButton = document.getElementById("add-button")! as HTMLButtonElement;
const submit = document.getElementById("submit-button")! as HTMLButtonElement;
const outputOl = document.getElementById("output-ol")!;

function scrollBottom() {
	document.getElementById("output-sec")!.scroll({
		top: outputOl.scrollHeight,
		behavior: "smooth"
	});
}


const time = new Date();
interface Message {
	content: string,
	sender: string,
	date: string,
	time: string,
	dataType: string,
	type: string,
	fileName?: string,
	fileSize?: string,
}

const ws = new WebSocket(`wss://${document.location.host}/chatSocket`);
ws.addEventListener("open", () => {
	console.log("Websocket connected");
	ws.send(JSON.stringify({ type: "chatFetchAll" }));
});

ws.addEventListener("message", async ({ data }) => {
	const json = JSON.parse(data);

	if (json.type === "chatPostMessage") renderMessage(json);
	else Object.values(json).forEach((element) => renderMessage(element as Message));
});

// html tags as variables
if (!localStorage.uuid) {
	inputBox.placeholder = "please sign in to use chat";
	inputBox.disabled = true;
	submit.disabled = true;
	addButton.disabled = true;
}

inputBox.focus();
inputBox.addEventListener("keydown", event => {
	switch (event.key) {
		case "Enter":
			if (inputBox.value !== "") send("txt", inputBox.value)
			inputBox.value = "";
			localStorage.savedInputValue = inputBox.value;
			break;
	}
});

function send(type: string, content: string, fileName?: string) {
	ws.send(JSON.stringify({
		content: content,
		sender: localStorage.uuid,
		date: `${time.toLocaleDateString()}`,
		time: getTime(),
		dataType: type,
		type: "chatPostMessage",
		fileName: fileName
	}));
}

inputBox.addEventListener("paste", async (e) => {
	for (const file of Array.from(e!.clipboardData!.files)) {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		if (reader.result !== null) {
			reader.onload = () => send(file.type.startsWith("image/") ? "img" : "file", reader.result!.toString())
		}
	}
});

inputBox.oninput = () => { localStorage.savedInputValue = inputBox.value; }

submit.addEventListener("click", () => {
	if (inputBox.value !== "") send("txt", inputBox.value)
	inputBox.value = "";
	localStorage.savedInputValue = inputBox.value;
});

function getTime() {
	let hour = time.getHours().toString();
	let minute = time.getMinutes().toString();
	if (hour.length === 1) hour = "0" + hour
	if (minute.length === 1) minute = "0" + minute

	return `${hour}:${minute}`;
}

// Handle images
addButton.onclick = () => {
	let fileInput = document.createElement("input");
	fileInput.type = "file"

	fileInput.onchange = () => {
		let file = fileInput.files![0];

		let reader = new FileReader();
		if (file.type.startsWith("image/")) {
			reader.readAsDataURL(file);
		} else {
			reader.readAsBinaryString(file);
		};

		reader.onload = e => {
			if (file.type.startsWith("image/")) {
				send("img", e.target!.result!.toString());
			} else {
				send("file", e.target!.result!.toString(), file.name);
			};
		};
	};

	fileInput.click();
}

// important functions
async function renderMessage(json: Message) {
	// render html message
	const li = document.createElement("li");

	const pfp = document.createElement("img");
	pfp.classList.add("pfp");
	const res = await fetch(`/fetchPFP?username=${json.sender}`);
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

	switch (json.dataType) {
		case "txt": {
			const p = document.createElement("p");
			p.classList.add("messageContent")
			p.innerHTML = json.content;
			if (p.innerHTML.includes("@")) {
				const user = p.innerHTML.match(/@\S+/)![0].split("@")[1];
				const pingsMe = await fetch(`/pingUser`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						username: user,
						uuid: localStorage.uuid
					})
				});
				const pingsMeText = await pingsMe.text();
				p.innerHTML = p.innerHTML.replace(/@\S+/, `<p class="ping">$&</p>`);
				if (pingsMeText === "true") li.classList.add("pingsMe");
			}
			p.innerHTML = p.innerHTML.replace(/http\S+/, '<a href="$&" target="_blank">$&</a>');
			li.appendChild(p);
			break;
		}
		case "img": {
			const img = document.createElement("img");
			img.src = json.content;
			img.classList.add("imageMessage");

			img.addEventListener("click", () => {
				img.classList.toggle("imagePreview");
				const observer = new ResizeObserver(scrollBottom);
				observer.observe(img);
				img.addEventListener("transitionend", () => observer.disconnect());
			});

			img.addEventListener("load", () => {
				img.style.height = `${img.naturalHeight}px`;
				img.style.width = `${img.naturalWidth}px`;
				scrollBottom();
			});

			li.appendChild(img);
			break;
		}
		case "file": {
			const div = document.createElement("div");
			div.innerHTML = `<div class="file-container-div">
				<div class="p-div">
					<a href="${json.content}" download="${json.fileName}"><b class="file-name" >${json.fileName!}</b></a><br>
					<p class="file-size">${json.fileSize!}</p>
				</div>
				<a href="${json.content}" download="${json.fileName}"><button class="fa-solid fa-download"></button></a>
			</div>`;


			li.appendChild(div.firstChild!); // dont know why i have to do this instead of outerHTML, but whatever
			break;
		}
	}

	outputOl.appendChild(li);
	scrollBottom();
}

setUserSettings();
