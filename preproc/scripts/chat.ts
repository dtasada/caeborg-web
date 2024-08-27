import { setUserSettings, getURL } from "./lib.js";

const inputBox = document.getElementById("input-box")! as HTMLInputElement;
const addButton = document.getElementById("add-button")! as HTMLButtonElement;
const submit = document.getElementById("submit-button")! as HTMLButtonElement;
const outputOl = document.getElementById("output-ol")!;
const outputSec = document.getElementById("output-sec")!;

let chunks = 1; // Amount of chunks shown on-screen. Also to be used as an index
let totalChunks: number; // Amount of total chunks of chat (saved from server)

function scrollBottom(smoothScrolling = true) {
	outputSec.scroll({
		top: outputSec.scrollHeight,
		behavior: smoothScrolling ? "smooth" : "instant"
	});
}

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
ws.onopen = () => {
	ws.send(JSON.stringify({
		type: "chatGetChunk",
		chunk: chunks.toString(),
	}));
	ws.send(JSON.stringify({ type: "chatGetMetadata" }));
};


ws.onmessage = async ({ data }) => {
	const json = JSON.parse(data);

	switch (json.type) {
		case "metadata": {
			totalChunks = json.chunks;
			outputSec.onscroll = () => {
				if (outputSec.scrollTop === 0 && chunks < totalChunks) {
					ws.send(JSON.stringify({ type: "chatGetChunk", chunk: (++chunks).toString() }));
				}
			}
			break;
		};
		case "chatPostMessage": {
			// Receiving a single message
			await renderMessage(json);
			break;
		};
		default: {
			// Receiving a chunk
			console.log("data:", json)
			if (chunks === 1) {
				// Set loading screen
				outputOl.hidden = true;

				outputSec.style.setProperty("justify-content", "center")
				outputSec.style.setProperty("align-items", "center");

				const h = document.createElement("h1");
				h.classList.add("title");
				h.style.setProperty("color", "var(--col-subtext)");
				h.innerHTML = "Loading chat...";

				outputSec.appendChild(h);
			}

			// Loading in the background
			(async () => {
				let shouldAppend = chunks === 1
				let shouldScroll = outputSec.scrollTop > 0 || shouldAppend
				let topMessage = outputOl.firstChild as HTMLElement;
				let array = shouldAppend ? json : json.reverse();
				for (let message of array) {
					// if this is the first load, append everything. If scrolling up, prepend every message to the array
					await renderMessage(message as Message, shouldAppend);
					if (!shouldScroll && topMessage) topMessage.scrollIntoView();
				}

				// When done loading
				outputOl.hidden = false;
				if (shouldScroll) scrollBottom(false)
				outputOl.querySelectorAll("li").forEach(message => finishStyle(message));

			})()
			break;
		}
	}
};

// html tags as variables
if (!localStorage.uuid) {
	inputBox.placeholder = "please sign in to use chat";
	inputBox.disabled = true;
	submit.disabled = true;
	addButton.disabled = true;
}

inputBox.focus();
inputBox.onkeydown = event => {
	switch (event.key) {
		case "Enter":
			if (inputBox.value !== "") send("txt", inputBox.value)
			inputBox.value = "";
			localStorage.savedInputValue = inputBox.value;
			break;
	}
};

function send(type: string, content: string, fileName?: string) {
	ws.send(JSON.stringify({
		content: content,
		sender: localStorage.uuid,
		date: `${new Date().toLocaleDateString()}`,
		time: getTime(),
		dataType: type,
		type: "chatPostMessage",
		fileName: fileName
	}));
}

inputBox.onpaste = async (e) => {
	for (const file of Array.from(e!.clipboardData!.files)) {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		if (reader.result !== null) {
			reader.onload = () => send(file.type.startsWith("image/") ? "img" : "file", reader.result!.toString())
		}
	}
};

inputBox.oninput = () => { localStorage.savedInputValue = inputBox.value; }

submit.onclick = () => {
	if (inputBox.value !== "") send("txt", inputBox.value)
	inputBox.value = "";
	localStorage.savedInputValue = inputBox.value;
};

function getTime(): string {
	let time = new Date();
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
async function renderMessage(json: Message, shouldAppend = true) {
	// render html message
	const li = document.createElement("li");

	const pfp = document.createElement("img");
	pfp.classList.add("pfp");
	const res = await fetch(`/getPFP?username=${json.sender}`);
	pfp.src = await res.text();
	pfp.alt = `${json.sender}'s pfp`;
	li.appendChild(pfp);

	const senderP = document.createElement("p");
	senderP.innerHTML = json.sender;
	senderP.classList.add("usernameTag");
	li.appendChild(senderP);

	const timedateP = document.createElement("p");
	if (json.date === new Date().toLocaleDateString()) json.date = "Today";
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

			// @ tag processing
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

			li.appendChild(p);

			// Link preview processing
			const match = /(^| )(www\.|http(.|):\/\/)\S+/;
			const matches = p.innerHTML.match(match);
			if (matches) {
				let link = getURL(matches[0]);
				const res = await (await fetch(`/siteMetadata?url=${link}`)).json();

				p.innerHTML = p.innerHTML.replace(matches[0], '<a href="$&" target="_blank">$&</a>');

				let previewDiv = document.createElement("div");
				previewDiv.classList.add("link-preview-div");
				previewDiv.innerHTML = `
				<img class="link-preview-img" src="${res.image}"></img>
				<div class="p-div">
						<a href="${link}" target="_blank"><b class="preview-name" >${res.title}</b></a><br>
						<p class="preview-description">${res.description}</p>
				</div>
				<a href="${link}" target="_blank"><button class="fa-solid fa-arrow-up-right-from-square"></button></a>
				`

				li.appendChild(previewDiv);

				let img = previewDiv.querySelector("img")!;
				img.onerror = () => {
					img.remove();
					previewDiv.style.removeProperty("padding-left");
				};
			}
			break;
		}
		case "img": {
			const img = document.createElement("img");
			img.src = json.content;
			img.classList.add("imageMessage");

			img.onclick = () => img.classList.toggle("imagePreview");

			img.onload = () => {
				img.style.height = `${img.naturalHeight}px`;
				img.style.width = `${img.naturalWidth}px`;
			};

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

	shouldAppend ? outputOl.appendChild(li) : outputOl.prepend(li);
	finishStyle(li);

	if (shouldAppend) scrollBottom();
}

function finishStyle(message: HTMLLIElement) {
	let previewDiv = message.querySelector(".link-preview-div") as HTMLDivElement;
	if (!previewDiv) return;
	let img = previewDiv.querySelector(".link-preview-img")! as HTMLImageElement;
	if (!img) return;

	let interval = setInterval((() => {
		const width = window.getComputedStyle(img).width;
		if (width) {
			previewDiv.style.paddingLeft = width;
			clearInterval(interval)
		}
	}), 500);
}

setUserSettings();
