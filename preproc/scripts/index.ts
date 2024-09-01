import { setUserSettings } from "./lib.js";

let sidebarOl = document.getElementById("sidebar-ol")!;

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

if (window.innerWidth >= 1200) {
	sidebarOl.style.display = "block";
	sidebarOl.classList.add("anim-in");
} else {
	sidebarOl.style.display = "none"
	sidebarOl.classList.add("anim-out");
}

window.addEventListener("resize", () => {
	// Keep addEventListener instead of `onresize = () => {}`. addEventListener doesn't work for some reason
	if (window.innerWidth >= 1200 && !sidebarOl.classList.contains("anim-in")) {
		sidebarOl.style.display = "block";
		sidebarOl.classList.replace("anim-out", "anim-in");
	} else if (window.innerWidth < 1200 && !sidebarOl.classList.contains("anim-out")) {
		sidebarOl.style.display = "none";
		sidebarOl.classList.replace("anim-in", "anim-out");
	}
});

sidebarOl.querySelectorAll("li > button").forEach(e => {
	let button = e as HTMLButtonElement
	button.onclick = () => switchFrame(button.dataset.target!);
});

function validate() {
	fetch("/validate", {
		method: "POST",
		headers: { "Content-Type": "text/plain" },
		body: localStorage.uuid,
	})
		.then(r => r)
		.then(r => r.text())
		.then(resText => {
			if (resText === "__userinvalid") localStorage.removeItem("uuid")

			document.getElementById(localStorage.uuid ? "login-button" : "account-button")!.style.display = "none"
		});
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
