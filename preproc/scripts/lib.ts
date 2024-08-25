// Converts any string into a valid URL
export function getURL(str: string) {
	const urlPattern = /^(|https?:\/\/)?(www\.)?([^\/\s]+)(.*)$/i;

	return str.replace(urlPattern, (match, protocol, www, domain, rest) => {
		protocol = protocol ? protocol.toLowerCase() : 'https://';
		domain = domain.replace(/(^|https?:\/\/)www\./, '');
		return `${protocol}${domain}${rest}`;
	});
}

export async function setUserSettings() {
	const res = await fetch("/assets/settings.json");
	const resText = await res.text();
	const userSettingsJSON = JSON.parse(resText);

	if (!localStorage.colorScheme) localStorage.colorScheme = "Catppuccin Dark";
	if (!localStorage.userFont) localStorage.userFont = "JetBrains Mono";

	const colorsObject = userSettingsJSON.colorSchemes[localStorage.colorScheme];

	let root = document.querySelector(":root") as HTMLElement;
	let iframe = document.getElementById("rest-iframe")! as HTMLIFrameElement
	let iframeRoot = iframe ? (iframe.contentDocument! as Document).querySelector(":root")! as HTMLElement : null;

	for (let colVar of Object.keys(colorsObject)) {
		root.style.setProperty(colVar, colorsObject[colVar]);
		if (iframeRoot) iframeRoot.style.setProperty(colVar, colorsObject[colVar]);
	}

	root.style.setProperty("--font", localStorage.userFont);
	if (iframeRoot) iframeRoot.style.setProperty("--font", localStorage.userFont);
}
