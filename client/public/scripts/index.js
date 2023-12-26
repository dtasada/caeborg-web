let isDark = true;
function setColors(toggle=true) {
	if (toggle === true) {
		isDark = !isDark;
		if (isDark) document.body.classList.remove("light-mode")
		else document.body.classList.add("light-mode")
	}

	const rootStyles = getComputedStyle(document.documentElement);
	const iframeStyles = document.querySelector("iframe").contentDocument.firstElementChild.style

    for (property of Object.values(rootStyles)) {
        if (property.startsWith('--col')) {
            iframeStyles.setProperty(property, rootStyles.getPropertyValue(property));
            console.log(property, rootStyles.getPropertyValue(property));
        }
    } 
}

// Switching frames
function switchFrame(page) {
	localStorage.setItem('saved_frame', page);

	document.getElementById("rest-iframe").remove();
	new_frame = document.createElement("iframe");

	Object.assign(new_frame, {
		id: "rest-iframe",
		src: `../pages/${page}.html${document.location.search}`,
		frameBorder: "0",
	});

	document.getElementById("rest-sec").appendChild(new_frame);
	switch (page) {
		case "calc": document.title = "Caeborg - Calculator"; break;
		case "chat": document.title = "Caeborg - Chatting"; break;
		case "chemtools": document.title = "Caeborg - ChemTools"; break;
		case "games": document.title = "Caeborg - Games"; break;
		case "graph": document.title = "Caeborg - Graph"; break;
		case "launcher": document.title = "Caeborg - Launcher"; break;
		case "maps": document.title = "Caeborg - Map"; break;
		case "meme": document.title = "Caeborg - Meme Maker"; break;
		case "paint": document.title = "Caeborg - Paint"; break;
		case "quote": document.title = "Caeborg - Quote"; break;
		case "shell": document.title = "Caeborg - Shell"; break;
		case "soundboard": document.title = "Caeborg - Soundboard"; break;
		case "translator": document.title = "Caeborg - Translator"; break;
	}
}

if (localStorage.getItem('saved_frame') === null) {
	localStorage.setItem('saved_frame', 'launcher');
} else {
	switchFrame(localStorage.getItem('saved_frame'))
}

if (document.location.search === "?dashboard=true") {
	switchFrame("launcher")
}
