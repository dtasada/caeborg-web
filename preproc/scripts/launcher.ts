import { setUserSettings, getURL } from "./lib.js";

const newShortcutSec = document.getElementById("new-shortcut-sec")!;
const launcherSec = document.getElementById("launcher-sec")!;
const urlInput = document.getElementById("url-input")! as HTMLInputElement;
const nameInput = document.getElementById("name-input")! as HTMLInputElement;
const faviconIMG = document.getElementById("favicon-img")! as HTMLImageElement;
const confirmButton = document.getElementById("confirm-button")! as HTMLButtonElement;
const deleteButton = document.getElementById("delete-button")! as HTMLButtonElement;

const addButton = document.getElementById("add-button")! as HTMLButtonElement;

let newFaviconURL: string;
let url: string;
let isNew: boolean;

let obj: Record<string, string>;

// Generating shortcuts on startup
function makeTitle(text: string) {
	launcherSec.style.setProperty("justify-content", "center")
	launcherSec.style.setProperty("align-items", "center");

	const h = document.createElement("h1");
	h.classList.add("title");
	h.style.setProperty("color", "var(--col-subtext)");
	h.innerHTML = text;

	launcherSec.appendChild(h)
}


async function genShortcuts() {
	let launcherOl = document.getElementById("launcher-ol")!;
	if (launcherOl) {
		launcherOl.innerHTML = "";
	} else {
		launcherOl = document.createElement("ol");
		launcherOl.id = "launcher-ol";
		launcherOl.classList.add("horizontal");
		launcherSec.appendChild(launcherOl);
	}

	const res = await fetch(`/getLauncher?uuid=${localStorage.uuid}`);
	const resText = await res.text()
	if (resText !== "__userinvalid") {
		obj = JSON.parse(resText);
	} else {
		makeTitle("Please sign in to use the launcher");
		addButton.setAttribute("disabled", "true");
		return;
	}

	if (Object.keys(obj).length === 0) {
		makeTitle("Your launcher is empty!<br>You can add shortcuts with<br>the bottom right button.");
		return;
	}

	for (const key of Object.keys(obj)) {
		const li = document.createElement("li");
		url = obj[key];
		li.innerHTML = `<button onclick="window.open('${url}')">
			<img src="/icon?url=${url}&size=64..128..256" width="128" height="128"/><br><p>${key}</p></button>`;
		launcherOl.appendChild(li);
	}

	document.querySelectorAll("#launcher-ol > li > button").forEach(button => {
		if (document.location.search === "?newTabDash") {
			const oldClick = button.getAttribute("onclick")!;
			button.setAttribute("onclick", oldClick.replace(/window.open(.*.)/, "window.parent.location.href=$1"))
		}

		(button as HTMLButtonElement).oncontextmenu = (event: Event) => {
			event.preventDefault();
			if (newShortcutSec.style.display === "flex") {
				cleanup();
			} else {
				newShortcutSec.style.display = "flex";
				nameInput.value = button.querySelector("p")!.innerHTML;
				urlInput.value = button.getAttribute("onclick")!.split("'")[1];
				faviconIMG.src = button.querySelector("img")!.src;

				placeholderFavicon();
				nameInput.focus();

				confirmButton.classList.add("half");
				deleteButton.classList.add("half");
				eventHandler(button);
			}
		};
	});

	setUserSettings();
}

genShortcuts();

// Functions for repetition
async function cleanup() {
	urlInput.value = "";
	nameInput.value = "";
	faviconIMG.style.opacity = "0";
	newShortcutSec.style.display = "none";

	confirmButton.classList.remove("half");
	deleteButton.classList.remove("half");

	await fetch("/postLauncher", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			uuid: localStorage.uuid,
			object: JSON.stringify(obj),
		})
	});

	isNew = true;

	genShortcuts();
}

function eventHandler(element?: Element) {
	nameInput.focus();
	nameInput.onkeydown = event => {
		if (event.key === "Enter") urlInput.focus();
	};

	window.onkeydown = event => {
		if (event.key === "Escape") cleanup();
	}

	if (element) {
		isNew = false;
		deleteButton.onclick = () => {
			delete obj[element.parentElement!.querySelector("p")!.innerHTML];
			cleanup();
		};
		urlInput.onkeydown = event => {
			if (event.key === "Enter") confirmAll(element);
		};
		confirmButton.onclick = () => confirmAll(element);
	} else {
		isNew = true;
		urlInput.onkeydown = event => {
			if (event.key === "Enter") confirmAll();
		};
		confirmButton.onclick = () => confirmAll();
	}
}

function placeholderFavicon() {
	if (urlInput !== null && urlInput !== undefined) {
		faviconIMG.style.opacity = "1";
		if (urlInput.value === "") {
			faviconIMG.style.opacity = "0";
			return;
		}
		url = getURL(urlInput.value);
		newFaviconURL = `/icon?url=${url}&size=64..128..256`
		faviconIMG.src = newFaviconURL;
	}
}

function confirmAll(element?: Element) {
	if (isNew === false) {
		delete obj[element!.querySelector("p")!.innerHTML];
	}
	obj[nameInput.value] = getURL(urlInput.value);
	cleanup();
}

urlInput.oninput = placeholderFavicon
addButton.onclick = () => {
	if (newShortcutSec.style.display === "flex") {
		cleanup();
	} else {
		newShortcutSec.style.display = "flex";
		eventHandler();
	}
}

setUserSettings();
