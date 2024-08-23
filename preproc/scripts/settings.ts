import { setUserSettings } from "./usersettings.js";
setUserSettings();

let themeSel = document.getElementById("theme-sel")! as HTMLSelectElement;
let fontSel = document.getElementById("font-sel")! as HTMLSelectElement;

let settings: any;

async function setButtons() {
	const res = await fetch("/assets/settings.json");
	const resText = await res.text();
	settings = JSON.parse(resText);

	// Themes
	let themePlaceholder = document.createElement("option");
	themePlaceholder.id = "theme-placeholder"
	themePlaceholder.innerHTML = themePlaceholder.value = "Theme";
	themeSel.append(themePlaceholder);

	for (let themeName of Object.keys(settings.colorSchemes)) {
		let themeButton = document.createElement("option");
		themeButton.innerHTML = themeButton.value = themeName;
		themeSel.append(themeButton);
	}

	// Fonts
	let fontPlaceholder = document.createElement("option");
	fontPlaceholder.id = "font-placeholder"
	fontPlaceholder.innerHTML = fontPlaceholder.value = "Font";
	themeSel.append(themePlaceholder);

	for (let fontName of settings.fonts) {
		let fontButton = document.createElement("option");
		fontButton.innerHTML = fontButton.value = fontName;
		fontSel.append(fontButton);
	}
}
setButtons()

themeSel.onclick = () => {
	localStorage.setItem("colorScheme", themeSel.value);
	setUserSettings();
	(document.getElementById("theme-placeholder") as HTMLButtonElement).disabled = true;
}

fontSel.onclick = () => {
	localStorage.setItem("userFont", fontSel.value);
	setUserSettings();
	(document.getElementById("font-placeholder") as HTMLButtonElement).disabled = true;
}
