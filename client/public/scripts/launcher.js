const ourUrl = window.location.href.split(/:[0-9]{4}/g)[0];

const new_shortcut_sec = document.getElementById('new-shortcut-sec');
const url_input = document.getElementById('url-input');
const name_input = document.getElementById('name-input');
const add_button = document.getElementById('add-button');
const favicon_img = document.getElementById('favicon-img');

const confirm_button = document.getElementById('confirm-button');
const delete_button = document.getElementById('delete-button');

let new_favicon_url;
let url;
let is_new = false;

// Starting localStorage values
function startLocalStorage() {
    const launcher_sec = document.getElementById('launcher-sec');
    const launcher_ol = document.createElement('ol');
    launcher_ol.id = 'launcher-ol';
    launcher_ol.classList.add('horizontal');
    if (localStorage.getItem('saved_launcher_ol') === null) {
        launcher_ol.innerHTML = 
            `
                <li><button onclick="window.open('https://hageveld.magister.net')">
                    <img src="${ourUrl}:8080/icon?url=https://hageveld.magister.net&size=64..128..256" width="128" height="128"/><br><p>Magister</p></button></li>
                <li><button onclick="window.open('https://youtube.com/')">
                    <img src="${ourUrl}:8080/icon?url=https://youtube.com&size=64..128..256" width="128" height="128"/><br><p>YouTube</p></button></li>
            `;
        localStorage.setItem('saved_launcher_ol', launcher_ol.innerHTML);
    } else {
        launcher_ol.innerHTML = localStorage.getItem('saved_launcher_ol');
    }
    launcher_sec.appendChild(launcher_ol);
}

startLocalStorage();

// Functions for repetition
function cleanup() {
    url_input.value = '';
    name_input.value = '';
    favicon_img.style.opacity = '0';
    new_shortcut_sec.style.display = 'none';
    delete_button.style.display = 'none';
    [...document.querySelectorAll('#buttons i')].forEach(element => {
        element.style.removeProperty('height');
        element.style.removeProperty('font-size');
        element.style.removeProperty('padding');
    });
    confirm_button.style.removeProperty('border-bottom-right-radius');
    confirm_button.style.removeProperty('border-bottom-left-radius');
    confirm_button.style.removeProperty('border-bottom');
    localStorage.setItem('saved_launcher_ol', document.getElementById('launcher-ol').innerHTML);
    is_new = true;
}

function getUrlFromInput() {
    if (url_input.value.includes('://')) val = url_input.value;
    else if (url_input.value.includes('www.')) val = url_input.value.replace('www.', 'http://') ;
    else val = `http://${url_input.value}`;
    return val;
}

function eventHandler(element) {
    console.log('event handler run.');
    console.log('event handler passed element:', element)

    name_input.focus();
    name_input.addEventListener('keydown', event => { if (event.key === 'Enter') url_input.focus() });
    
    window.addEventListener('keydown', event => { if (event.key === 'Escape') cleanup(); })

    if (element) {
        console.log('event handler if state 1 run.');
        is_new = false;
        delete_button.addEventListener('click', () => { element.parentElement.remove(); cleanup() });
        url_input.addEventListener('keydown', event => {
			if (event.key === 'Enter') {
			console.log('confirm() at eventHandler():78');
                confirm(element, false)
            }
        });
        confirm_button.addEventListener('click', () => {
			console.log('confirm() at eventHandler():79');
            confirm(element, false)
        });
    } else {
        is_new = true;
        console.log('event handler if state 2 run.');
        url_input.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                console.log('confirm() at eventHandler():83');
                confirm(undefined, true)
            }
        });
        confirm_button.addEventListener('click', () => {
            console.log('confirm() at eventHandler():84');
            confirm(undefined, true)
        });
    }
}

function placeholderFavicon() {
    if (url_input !== null || url_input !== undefined) {
        favicon_img.style.opacity = '1';
        if (url_input.value === '') {
            favicon_img.style.opacity = '0';
            return;
        }
        url = getUrlFromInput();
        new_favicon_url = `${ourUrl}:8080/icon?url=${url}&size=64..128..256`
        favicon_img.src = new_favicon_url;
    }
}

function addShortcut() {
    if (new_shortcut_sec.style.display === 'flex') {
        cleanup();
    } else {
        new_shortcut_sec.style.display = 'flex';
        console.log('eventHandler() at "addShortcut()"')
        eventHandler();
    }
}

// Real functional functions
function confirm(element, is_new_bool) {
    console.log('running confirm()');
    console.log('is_new at confirm():', is_new);
    if (is_new_bool === true && !element) {
        console.log('confirm if state 1');
        const launcher_ol = document.getElementById('launcher-ol');
        const new_shortcut = document.createElement('li');
        new_shortcut.innerHTML = 
            `
                <button onclick="window.open('${url}')">
                    <img src="${new_favicon_url}" width="128" height="128"/><br><p>${name_input.value}</p>
                </button>
            `;
        launcher_ol.appendChild(new_shortcut);
    } else if (element) {
        console.log('confirm if state 2');
        const img = element.querySelector('img');
        const p = element.querySelector('p');
        console.log('confirm if state 2, passed element:', element);
        console.log('confirm if state 2, passed img:', img);
        console.log('confirm if state 2, passed p:', p);
        p.innerHTML = name_input.value;
        img.src = `${ourUrl}:8080/icon?url=${getUrlFromInput()}&size=64..128..256`;
        element.setAttribute('onclick', `window.open('${getUrlFromInput()}')`);
    }
    cleanup();
}

[...document.querySelectorAll('#launcher-ol > li > button')].forEach(element => {
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

            delete_button.style.display = 'block';
            confirm_button.style.borderBottomRightRadius = '0px';
            confirm_button.style.borderBottomLeftRadius = '0px';
            confirm_button.style.borderBottom = '1px solid $col-crust';
            [...document.querySelectorAll('#buttons i')].forEach(element => {
                element.style.height = '64px';
                element.style.fontSize = '44px';
                element.style.setProperty('padding', '8px 0px');
            });
            console.log('eventHandler() at forEach');
            eventHandler(element);
        }
    });
});
