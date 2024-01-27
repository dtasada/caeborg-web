async function validate() {
	res = await fetch("/validate", {
		method: "POST",
		headers: { "Content-Type": "text/plain" },
		body: localStorage.uuid,
	});
	res = await res.text()
	if (res === "__userinvalid") localStorage.removeItem("uuid")

	document.getElementById(localStorage.uuid ? "login-button" : "account-button").style.display = "none"
}
validate();

// Switching frames
function switchFrame(page) {
	localStorage.savedFrame = page;

	document.getElementById("rest-iframe").remove();
	newFrame = document.createElement("iframe");

	Object.assign(newFrame, {
		id: "rest-iframe",
		src: `/pages/${page}.html${document.location.search}`,
		frameBorder: "0",
	});

	document.getElementById("rest-sec").appendChild(newFrame);

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

for (param of document.location.search.split("&")) {
	if (param === "?newTabDash") {
		switchFrame("launcher")
		window.history.pushState({}, document.title, document.location.search.replace(param, ""))
	}
}

if (localStorage.savedFrame) switchFrame(localStorage.savedFrame)
else localStorage.savedFrame = 'launcher';
