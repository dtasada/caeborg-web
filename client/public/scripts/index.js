const restSec = document.getElementById('rest-sec');
const footerSec = document.getElementById('footer-sec');
const sidebarSec = document.getElementById('sidebar-sec');

let isHiddenUserChoice = null;

function setValues() {
	restSecLeftDefault = window.getComputedStyle(restSec).left;
	restSecRightDefault = window.getComputedStyle(restSec).right;
	restSecWidthDefault = window.getComputedStyle(restSec).width;
	footerSecLeftDefault = window.getComputedStyle(footerSec).left;
	footerSecRightDefault = window.getComputedStyle(footerSec).right;
	footerSecWidthDefault = window.getComputedStyle(footerSec).width;
}

setValues();

document.getElementById('menu-button').addEventListener('click', () => {
	if (isHiddenUserChoice === null) isHiddenUserChoice = true;
	else if (isHiddenUserChoice === true) isHiddenUserChoice = false;
	else if (isHiddenUserChoice === false) isHiddenUserChoice = true;
});

let shouldBeDark = true;
function setColorScheme(shouldToggle=true) {
	if (shouldToggle === true) {
		if (shouldBeDark === true) shouldBeDark = false;
		else if (shouldBeDark === false) shouldBeDark = true;
	}

	things = [
		document.querySelector(":root").style,
		document.querySelector("iframe").contentWindow.document.querySelector(":root").style,
		document.querySelector("iframe").contentWindow.document.querySelector("html").style,
		document.querySelector("iframe").contentWindow.document.querySelector("body").style,
	];

	console.log(things);

	for (element of things) {
		if (shouldBeDark === true) {
			element.setProperty('--col-crust', '#181926');
			element.setProperty('--col-subbase', '#1e2030');
			element.setProperty('--col-base', '#24273a');
			element.setProperty('--col-surfac0e', '#363a4f');
			element.setProperty('--col-suboverlay', '#5b6078');
			element.setProperty('--col-overlay', '#6e738d');
			element.setProperty('--col-subtext', '#a5abcd');
			element.setProperty('--col-text', '#cad3f5');
			element.setProperty('--col-white', '#eff1f5');
			element.setProperty('--col-red', '#ed8796');
			element.setProperty('--col-orange', '#f5a97f');
			element.setProperty('--col-yellow', '#eed49f');
			element.setProperty('--col-green', '#a6da95');
			element.setProperty('--col-blue', '#8aadf4');
			element.setProperty('--col-lightrose', '#f4dbd6');
		} else if (shouldBeDark === false) {
			element.setProperty('--col-crust', '#dce0e8');
			element.setProperty('--col-subbase', '#e6e9ef');
			element.setProperty('--col-base', '#eff1f5');
			element.setProperty('--col-surface', '#ccd0da');
			element.setProperty('--col-suboverlay', '#acb0be');
			element.setProperty('--col-overlay', '#9ca0b0');
			element.setProperty('--col-subtext', '#6c6f85');
			element.setProperty('--col-text', '#4c4f69');
			element.setProperty('--col-white', '#24273a');
			element.setProperty('--col-red', '#d20f39');
			element.setProperty('--col-orange', '#fe640b');
			element.setProperty('--col-yellow', '#df8e1d');
			element.setProperty('--col-green', '#40a02b');
			element.setProperty('--col-blue', '#1e66f5');
			element.setProperty('--col-lightrose', '#dc8a78');
		}
	}
}

function toggleSidebarSec(mode=null) {
	if ((mode === null && sidebarSec.hidden === false) || mode === 'hidden') {
		sidebarSec.hidden = true;

		if (window.innerWidth >= 700) {
			restSec.style.left = `calc(100% - ${restSecWidthDefault} - ${restSecLeftDefault} / 2)`;
			footerSec.style.left = `calc(100% - ${restSecWidthDefault} - ${restSecLeftDefault} / 2)`;
		} else {
			restSec.style.left = '4px';
			restSec.style.right = '4px';
			footerSec.style.left = '4px';
			footerSec.style.right = '4px';
			restSec.style.width = 'calc(100% - 4px)';
			footerSec.style.width = 'calc(100% - 4px)';
		}

	} else if ((mode === null && sidebarSec.hidden === true) || mode === 'shown') {
		sidebarSec.hidden = false;

		restSec.style.left = restSecLeftDefault;
		restSec.style.right = restSecRightDefault;
		restSec.style.width = restSecWidthDefault;
		footerSec.style.left = footerSecLeftDefault;
		footerSec.style.right = footerSecRightDefault;
		footerSec.style.width = footerSecWidthDefault;
		setValues();
	}
}

if (window.innerWidth <= 700 && isHiddenUserChoice !== false) toggleSidebarSec('hidden');

window.addEventListener("resize", () => {
	restSec.removeAttribute('style');
	restSec.removeAttribute('style');
	footerSec.removeAttribute('style');
	setValues()
	if (window.innerWidth <= 700 && isHiddenUserChoice !== false) toggleSidebarSec('hidden')
	else if (window.innerWidth > 700 && isHiddenUserChoice !== true) toggleSidebarSec('shown')
});

// Switching frames
function switchFrame(page) {
	localStorage.setItem('saved_frame', page);

	document.getElementById("rest-iframe").remove();
	new_frame = document.createElement("iframe");

	Object.assign(new_frame, {
		id: "rest-iframe",
		src: `../pages/${page}.html`,
		frameBorder: "0",
	});

	document.getElementById("rest-sec").appendChild(new_frame);
	setColorScheme(false);
	switch (page) {
		case 'calc': document.title = 'Caeborg - Calculator'; break;
		case 'chat': document.title = 'Caeborg - Chatting'; break;
		case 'chemtools': document.title = 'Caeborg - ChemTools'; break;
		case 'games': document.title = 'Caeborg - Games'; break;
		case 'graph': document.title = 'Caeborg - Graph'; break;
		case 'launcher': document.title = 'Caeborg - Launcher'; break;
		case 'maps': document.title = 'Caeborg - Map'; break;
		case 'meme': document.title = 'Caeborg - Meme Maker'; break;
		case 'paint': document.title = 'Caeborg - Paint'; break;
		case 'quote': document.title = 'Caeborg - Quote'; break;
		case 'shell': document.title = 'Caeborg - Shell'; break;
		case 'translator': document.title = 'Caeborg - Translator'; break;
	}
}

if (localStorage.getItem('saved_frame') === null) {
	localStorage.setItem('saved_frame', 'launcher');
} else {
	switchFrame(localStorage.getItem('saved_frame'))
}
