const restSec = document.getElementById('rest-sec');
const footerSec = document.getElementById('footer-sec');
const sidebarSec = document.getElementById('sidebar-sec');
let isHiddenUserChoice = null;
function setValues() {
	rest_sec_left_default = window.getComputedStyle(restSec).left;
	rest_sec_right_default = window.getComputedStyle(restSec).right;
	rest_sec_width_default = window.getComputedStyle(restSec).width;
	footer_sec_left_default = window.getComputedStyle(footerSec).left;
	footer_sec_right_default = window.getComputedStyle(footerSec).right;
	footer_sec_width_default = window.getComputedStyle(footerSec).width;
}

setValues();

document.getElementById('menu-button').addEventListener('click', () => {
	if (isHiddenUserChoice === null) isHiddenUserChoice = true;
	if (isHiddenUserChoice === true) isHiddenUserChoice = false;
	if (isHiddenUserChoice === false) isHiddenUserChoice = true;
});

let colorIsDark = true;
console.log(colorIsDark);
function toggleColors() {
	if (colorIsDark === true) {
		colorIsDark = false;
		console.log(colorIsDark);
		[...document.querySelectorAll(":root")].forEach(element => {
			element.style.setProperty('--col-crust', '#181926');
			element.style.setProperty('--col-subbase', '#1e2030');
			element.style.setProperty('--col-base', '#24273a');
			element.style.setProperty('--col-surface', '#363a4f');
			element.style.setProperty('--col-suboverlay', '#5b6078');
			element.style.setProperty('--col-overlay', '#6e738d');
			element.style.setProperty('--col-subtext', '#a5abcd');
			element.style.setProperty('--col-text', '#cad3f5');
			element.style.setProperty('--col-red', '#ed8796');
			element.style.setProperty('--col-orange', '#f5a97f');
			element.style.setProperty('--col-yellow', '#eed49f');
			element.style.setProperty('--col-green', '#a6da95');
			element.style.setProperty('--col-blue', '#8aadf4');
			element.style.setProperty('--col-lightrose', '#f4dbd6');
		})
	}
	else if (colorIsDark === false) {
		colorIsDark = true;
		console.log(colorIsDark);
		[...document.querySelectorAll(":root")].forEach(element => {
			element.style.setProperty('--col-crust', '#dce0e8');
			element.style.setProperty('--col-subbase', '#e6e9ef');
			element.style.setProperty('--col-base', '#eff1f5');
			element.style.setProperty('--col-surface', '#ccd0da');
			element.style.setProperty('--col-suboverlay', '#acb0be');
			element.style.setProperty('--col-overlay', '#9ca0b0');
			element.style.setProperty('--col-subtext', '#6c6f85');
			element.style.setProperty('--col-text', '#4c4f69');
			element.style.setProperty('--col-red', '#d20f39');
			element.style.setProperty('--col-orange', '#fe640b');
			element.style.setProperty('--col-yellow', '#df8e1d');
			element.style.setProperty('--col-green', '#40a02b');
			element.style.setProperty('--col-blue', '#1e66f5');
			element.style.setProperty('--col-lightrose', '#dc8a78');
		});
	}
}

function toggleSidebarSec(mode=null) {
	if ((mode === null && sidebarSec.hidden === false) || mode === 'hidden') {
		sidebarSec.hidden = true;

		if (window.innerWidth >= 700) {
			restSec.style.left = `calc(100% - ${rest_sec_width_default} - ${rest_sec_left_default} / 2)`;
			footerSec.style.left = `calc(100% - ${rest_sec_width_default} - ${rest_sec_left_default} / 2)`;
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

		restSec.style.left = rest_sec_left_default;
		restSec.style.right = rest_sec_right_default;
		restSec.style.width = rest_sec_width_default;
		footerSec.style.left = footer_sec_left_default;
		footerSec.style.right = footer_sec_right_default;
		footerSec.style.width = footer_sec_width_default;
		setValues();
	}
}

if (window.innerWidth <= 700) toggleSidebarSec('hidden')

window.addEventListener("resize", () => {
	restSec.removeAttribute('style');
	restSec.removeAttribute('style');
	footerSec.removeAttribute('style');
	setValues()
	if (window.innerWidth <= 700 && isHiddenUserChoice !== false) toggleSidebarSec('hidden')
	if (window.innerWidth > 700 && isHiddenUserChoice !== true) toggleSidebarSec('shown')
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
