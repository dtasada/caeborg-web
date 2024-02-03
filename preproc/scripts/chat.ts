export {};
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
			localStorage.savednputValue = inputBox.value;
		break;
	}
});

function send(type: string, content: string) {
	ws.send(JSON.stringify({
		content: content,
		sender: localStorage.uuid,
		date: `${time.toLocaleDateString()}`,
		time: getTime(),
		dataType: type,
		type: "chatPostMessage"
	}));
}

inputBox.addEventListener("paste", async (e) => {
	for (const img of Array.from(e!.clipboardData!.files)) {
		const reader = new FileReader();
		reader.readAsDataURL(img);
		if (reader.result !== null) {
			reader.onload = () => {
				send("img", reader.result!.toString())
			}
		}
	}
});

inputBox.oninput = () => { localStorage.savednputValue = inputBox.value; }

submit.addEventListener("click", () => {
	if (inputBox.value !== "") send("txt", inputBox.value)
	inputBox.value = "";
	localStorage.savednputValue = inputBox.value;
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
		const file = (event.target as HTMLInputElement).files![0];
		if (file.type.startsWith("image/")) {
			const reader = new FileReader();
			if (reader.result) {
				reader.onload = () => {
					send("img", reader.result!.toString());
				};
			}
			reader.readAsDataURL(file);
		} else {
			inputBox.placeholder = "file format not supported!";
		}
	});
	inputFile.click();
});

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

	if (json.dataType === "txt") {
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
	} else if (json.dataType === "img") {
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
	}

	outputOl.appendChild(li);
	scrollBottom();
}
