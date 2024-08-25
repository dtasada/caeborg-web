import { setUserSettings } from "./lib.js";

async function setButtons() {
	await setUserSettings();

	let themeList = document.getElementById("theme-list")! as HTMLDivElement;
	let fontList = document.getElementById("font-list")! as HTMLDivElement;

	const res = await fetch("/assets/settings.json");
	const resText = await res.text();
	let settings = JSON.parse(resText);

	// Themes
	for (let themeName of Object.keys(settings.colorSchemes)) {
		let themeButton = document.createElement("button");
		themeButton.innerHTML = themeName;
		if (localStorage.colorScheme == themeButton.innerHTML) themeButton.classList.add("active");
		themeList.append(themeButton);
	}

	// Fonts
	for (let fontName of settings.fonts) {
		let fontButton = document.createElement("button");
		fontButton.innerHTML = fontName;
		if (localStorage.userFont == fontButton.innerHTML) fontButton.classList.add("active");
		fontList.append(fontButton);
	}

	themeList.querySelectorAll("button:not(.icon)").forEach(button => {
		(button as HTMLButtonElement).onclick = () => {
			localStorage.setItem("colorScheme", button.innerHTML);
			document.querySelectorAll("#theme-sec button").forEach(button => button.classList.remove("active"));
			button.classList.add("active")
			setUserSettings();
		}
	})

	fontList.querySelectorAll("button:not(.icon)").forEach(button => {
		(button as HTMLButtonElement).onclick = () => {
			localStorage.setItem("userFont", button.innerHTML);
			document.querySelectorAll("#font-sec button").forEach(button => button.classList.remove("active"));
			button.classList.add("active")
			setUserSettings();
		}
	})

	document.querySelectorAll("button.icon").forEach(button => {
		(button as HTMLButtonElement).onmouseenter = () => {
			if ((button.nextSibling as HTMLDivElement).nodeName == "#text") button.nextSibling?.remove();
			let list = button.nextSibling as HTMLDivElement;
			list.style.display = "flex";
			list.classList.add("animate");
			button.classList.add("animate");

			button.parentElement!.addEventListener("mouseleave", () => {
				list.classList.remove("animate");
				button.classList.remove("animate");
			}, { once: true });
		};
	})
}

setButtons()

