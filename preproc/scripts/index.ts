import { setUserSettings } from "./lib.js";

let names: Record<string, string> = {
	"calc": "Calculator",
	"chat": "Chat",
	"games": "Games",
	"graph": "Graphing Tool",
	"quote": "Inspirobot™",
	"meme": "Meme Maker",
	"notes": "Notes",
	"paint": "Paint",
	"shell": "Shell",
	"translate": "Translate",
	"launcher": "Launcher",
}

document.querySelectorAll("#sidebar-ol li > button").forEach(e => {
	let button = e as HTMLButtonElement
	button.onclick = () => switchFrame(button.dataset.target!);
});

async function validate() {
	const res = await fetch("/validate", {
		method: "POST",
		headers: { "Content-Type": "text/plain" },
		body: localStorage.uuid,
	});
	const resText = await res.text()
	if (resText === "__userinvalid") localStorage.removeItem("uuid")

	document.getElementById(localStorage.uuid ? "login-button" : "account-button")!.style.display = "none"
}
validate();

// Switching frames
function switchFrame(page: string) {
	document.querySelectorAll(`#sidebar-ol li > button`).forEach(e => {
		let button = e as HTMLButtonElement;
		if (button.dataset.target === page) button.classList.add("active")
		else button.classList.remove("active")
	})

	localStorage.savedFrame = page;

	document.getElementById("rest-iframe")!.remove();
	const newFrame = document.createElement("iframe");

	Object.assign(newFrame, {
		id: "rest-iframe",
		src: `/pages/${page}.html${document.location.search}`,
		frameBorder: "0",
	});

	document.getElementById("mid-sec")!.appendChild(newFrame);

	document.title = `Caeborg - ${names[page]}`
	setUserSettings();
}

for (const param of document.location.search.split("&")) {
	if (param === "?newTabDash") {
		switchFrame("launcher");
		window.location.replace(window.location.origin);
	}
}

if (localStorage.savedFrame) switchFrame(localStorage.savedFrame)
else localStorage.savedFrame = 'launcher';

setUserSettings();
