const newShortcutSec = document.getElementById("new-shortcut-sec");
const urlInput = document.getElementById("url-input");
const nameInput = document.getElementById("name-input");
const addButton = document.getElementById("add-button");
const faviconIMG = document.getElementById("favicon-img");

const confirmButton = document.getElementById("confirm-button");
const deleteButton = document.getElementById("delete-button");

let newFaviconURL;
let url;
let isNew;

let obj;

// Generating shortcuts on startup
async function genShortcuts() {
	if (document.querySelector("launcher-ol")) {
		document.querySelector("launcher-ol").remove()
		document.querySelector("launcher-sec").remove()
	}

	const launcherSec = document.getElementById("launcher-sec");
	const launcherOl = document.createElement("ol");
	launcherOl.id = "launcher-ol";
	launcherOl.classList.add("horizontal");

	res = await fetch(`/fetchLauncher?uuid=${localStorage.uuid}`);
	obj = await res.json();

	for (key of Object.keys(obj)) {
		li = document.createElement("li");
		url = obj[key]
		li.innerHTML = `<button onclick="window.open('${url}')">
			<img src="/icon?url=${url}&size=64..128..256" width="128" height="128"/><br><p>${key}</p></button>`;
		launcherOl.appendChild(li);
	}

	launcherSec.appendChild(launcherOl);
}

genShortcuts();

// Functions for repetition
function cleanup() {
	urlInput.value = "";
	nameInput.value = "";
	faviconIMG.style.opacity = "0";
	newShortcutSec.style.display = "none";

	confirmButton.classList.remove("half");
	deleteButton.classList.remove("half");

	asdf = fetch("/postLauncher", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			uuid: uuid,
			object: JSON.stringify(obj),
		})
	});
	location.reload();
	isNew = true;
}

function getUrlFromInput() {
	if (urlInput.value.includes("://")) val = urlInput.value;
	else if (urlInput.value.includes("www.")) val = urlInput.value.replace("www.", "http://") ;
	else val = `http://${urlInput.value}`;
	return val;
}

function eventHandler(element) {
	nameInput.focus();
	nameInput.addEventListener("keydown", event => { if (event.key === "Enter") urlInput.focus() });
	
	window.addEventListener("keydown", event => { if (event.key === "Escape") cleanup(); })

	if (element) {
		isNew = false;
		deleteButton.addEventListener("click", () => { delete obj[element.parentElement.querySelector("p").innerHTML]; cleanup() });
		urlInput.addEventListener("keydown", event => { if (event.key === "Enter") confirm(element) });
		confirmButton.addEventListener("click", () => { confirm(element) });
	} else {
		isNew = true;
		urlInput.addEventListener("keydown", event => { if (event.key === "Enter") confirm() });
		confirmButton.addEventListener("click", () => { confirm() });
	}
}

function placeholderFavicon() {
	if (urlInput !== null && urlInput !== undefined) {
		faviconIMG.style.opacity = "1";
		if (urlInput.value === "") {
			faviconIMG.style.opacity = "0";
			return;
		}
		url = getUrlFromInput();
		newFaviconURL = `/icon?url=${url}&size=64..128..256`
		faviconIMG.src = newFaviconURL;
	}
}

function addShortcut() {
	if (newShortcutSec.style.display === "flex") {
		cleanup();
	} else {
		newShortcutSec.style.display = "flex";
		eventHandler();
	}
}

// Real functional functions
function confirm(element) {
	if (isNew === false) {
		delete obj[element.querySelector("p").innerHTML];
	}
	obj[nameInput.value] = getUrlFromInput();
	cleanup();
}

[...document.querySelectorAll("#launcher-ol > li > button")].forEach(element => {
	if (document.location.search === "?newTabDash") {
		oldClick = element.getAttribute("onclick")
		element.setAttribute("onclick", oldClick.replace(/window.open(.*.)/, "window.parent.location.href=$1"))
	}

	element.addEventListener("contextmenu", (event) => {
		event.preventDefault();
		if (newShortcutSec.style.display === "flex") {
			cleanup();
		} else {
			newShortcutSec.style.display = "flex";
			nameInput.value = element.querySelector("p").innerHTML;
			urlInput.value = element.getAttribute("onclick").split('"')[1];
			faviconIMG.src = element.querySelector("img").src;

			placeholderFavicon();
			nameInput.focus();

			confirmButton.classList.add("half");
			deleteButton.classList.add("half");
			eventHandler(element);
		}
	});
});
