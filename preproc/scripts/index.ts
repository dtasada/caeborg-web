document.querySelectorAll("#sidebar-ol li > button").forEach(element => {
	(element as HTMLButtonElement).addEventListener("click", () => {
		let url: string;
		switch (element.innerHTML) {
			case "Calculator": url = "calc"; break;
			case "Chatting": url = "chat"; break;
			case "Graphing Tool": url = "graph"; break;
			case "Inspirobot™": url = "quote"; break;
			case "Google Maps": url = "map"; break;
			case "Meme Maker": url = "meme"; break;
			case "Notes": url = "notes"; break;
			default: url = element.innerHTML.toLowerCase();
		}
		switchFrame(url);
	});
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
	localStorage.savedFrame = page;

	document.getElementById("rest-iframe")!.remove();
	const newFrame = document.createElement("iframe");

	Object.assign(newFrame, {
		id: "rest-iframe",
		src: `/pages/${page}.html${document.location.search}`,
		frameBorder: "0",
	});

	document.getElementById("rest-sec")!.appendChild(newFrame);

	switch (page) {
		case "calc":		document.title = "Caeborg - Calculator"; break;
		case "chat":		document.title = "Caeborg - Chatting"; break;
		case "games":		document.title = "Caeborg - Games"; break;
		case "graph":		document.title = "Caeborg - Graph"; break;
		case "launcher":	document.title = "Caeborg - Launcher"; break;
		case "maps":		document.title = "Caeborg - Map"; break;
		case "meme":		document.title = "Caeborg - Meme Maker"; break;
		case "notes":		document.title = "Caeborg - Notes"; break;
		case "paint":		document.title = "Caeborg - Paint"; break;
		case "quote":		document.title = "Caeborg - Quote"; break;
		case "shell":		document.title = "Caeborg - Shell"; break;
		case "translator":	document.title = "Caeborg - Translator"; break;
	}
}

for (const param of document.location.search.split("&")) {
	if (param === "?newTabDash") {
		switchFrame("launcher");
		window.location.replace(window.location.origin);
	}
}

if (localStorage.savedFrame) switchFrame(localStorage.savedFrame)
else localStorage.savedFrame = 'launcher';
