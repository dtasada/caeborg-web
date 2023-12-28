const new_shortcut_sec = document.getElementById('new-shortcut-sec');
const url_input = document.getElementById('url-input');
const name_input = document.getElementById('name-input');
const add_button = document.getElementById('add-button');
const favicon_img = document.getElementById('favicon-img');

const confirm_button = document.getElementById('confirm-button');
const delete_button = document.getElementById('delete-button');

let new_favicon_url;
let url;
let is_new;

let obj;

// Starting localStorage values
function genShortcuts() {
	if (document.querySelector('launcher-ol')) {
		document.querySelector('launcher-ol').remove()
		document.querySelector('launcher-sec').remove()
	}

	const launcher_sec = document.getElementById('launcher-sec');
	const launcher_ol = document.createElement('ol');
	launcher_ol.id = 'launcher-ol';
	launcher_ol.classList.add('horizontal');

	if (localStorage.getItem('saved_launcher_ol') === null) {
		localStorage.setItem("saved_launcher_ol", JSON.stringify({
			Magister: "https://hageveld.magister.net",
			YouTube: "https://youtube.com",
		}))
	}

	obj = JSON.parse(localStorage.getItem("saved_launcher_ol"))

	for (key of Object.keys(obj)) {
		li = document.createElement("li");
		url = obj[key]
		li.innerHTML = `<button onclick="window.open('${url}')">
			<img src="/icon?url=${url}&size=64..128..256" width="128" height="128"/><br><p>${key}</p></button>`;
		launcher_ol.appendChild(li);
	}

	launcher_sec.appendChild(launcher_ol);
}

genShortcuts();

// Functions for repetition
function cleanup() {
	url_input.value = '';
	name_input.value = '';
	favicon_img.style.opacity = '0';
	new_shortcut_sec.style.display = 'none';

	confirm_button.classList.remove('half');
	delete_button.classList.remove('half');

	localStorage.setItem('saved_launcher_ol', JSON.stringify(obj));
	location.reload();
	is_new = true;
}

function getUrlFromInput() {
	if (url_input.value.includes('://')) val = url_input.value;
	else if (url_input.value.includes('www.')) val = url_input.value.replace('www.', 'http://') ;
	else val = `http://${url_input.value}`;
	return val;
}

function eventHandler(element) {
	name_input.focus();
	name_input.addEventListener('keydown', event => { if (event.key === 'Enter') url_input.focus() });
	
	window.addEventListener('keydown', event => { if (event.key === 'Escape') cleanup(); })

	if (element) {
		is_new = false;
		delete_button.addEventListener('click', () => { delete obj[element.parentElement.querySelector('p').innerHTML]; cleanup() });
		url_input.addEventListener('keydown', event => { if (event.key === 'Enter') confirm(element) });
		confirm_button.addEventListener('click', () => { confirm(element) });
	} else {
		is_new = true;
		url_input.addEventListener('keydown', event => { if (event.key === 'Enter') confirm() });
		confirm_button.addEventListener('click', () => { confirm() });
	}
}

function placeholderFavicon() {
	if (url_input !== null && url_input !== undefined) {
		favicon_img.style.opacity = '1';
		if (url_input.value === '') {
			favicon_img.style.opacity = '0';
			return;
		}
		url = getUrlFromInput();
		new_favicon_url = `/icon?url=${url}&size=64..128..256`
		favicon_img.src = new_favicon_url;
	}
}

function addShortcut() {
	if (new_shortcut_sec.style.display === 'flex') {
		cleanup();
	} else {
		new_shortcut_sec.style.display = 'flex';
		eventHandler();
	}
}

// Real functional functions
function confirm(element) {
	if (is_new === false) {
		delete obj[element.querySelector('p').innerHTML];
	}
	obj[name_input.value] = getUrlFromInput();
	cleanup();
}

[...document.querySelectorAll('#launcher-ol > li > button')].forEach(element => {
	if (document.location.search === "?newTabDash") {
		oldClick = element.getAttribute("onclick")
		element.setAttribute("onclick", oldClick.replace(/window.open(.*.)/, "window.parent.location.href=$1"))
	}

	element.addEventListener('contextmenu', () => {
		event.preventDefault();
		if (new_shortcut_sec.style.display === 'flex') {
			cleanup();
		} else {
			new_shortcut_sec.style.display = 'flex';
			name_input.value = element.querySelector('p').innerHTML;
			url_input.value = element.getAttribute('onclick').split("'")[1];
			favicon_img.src = element.querySelector('img').src;

			placeholderFavicon();
			name_input.focus();

			confirm_button.classList.add('half');
			delete_button.classList.add('half');
			eventHandler(element);
		}
	});
});
