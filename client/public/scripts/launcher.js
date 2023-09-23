const ourUrl = window.location.href.split(/:[0-9]{4}/g)[0];

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

// Shortcut buttons
const new_shortcut_sec = document.getElementById('new-shortcut-sec');
const url_input = document.getElementById('url-input');
const name_input = document.getElementById('name-input');
const add_button = document.getElementById('add-button');
const favicon_img = document.getElementById('favicon-img');

let new_favicon_url;
let url;

function cleanup() {
    url_input.value = '';
    name_input.value = '';
    favicon_img.style.opacity = '0';
    new_shortcut_sec.style.display = 'none';
    document.getElementById('delete-button').style.display = 'none';
    [...document.querySelectorAll('#buttons i')].forEach(element => {
        element.style.removeProperty('height');
        element.style.removeProperty('font-size');
        element.style.removeProperty('padding');
    });
    localStorage.setItem('saved_launcher_ol', document.getElementById('launcher-ol').innerHTML);
}

function getUrlFromInput() {
    if (url_input.value.includes('://')) val = url_input.value.split('://')[1];
    else if (url_input.value.includes('www.')) val = url_input.value.replace('www.', 'http://') ;
    else val = `http://${url_input.value}`;
    return val;
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
        url_input.focus();
        url_input.addEventListener('keydown', event => { if (event.key === 'Enter') name_input.focus() });
        name_input.addEventListener('keydown', event => { if (event.key === 'Enter') confirm() });
        window.addEventListener('keydown', event => { if (event.key === 'Escape') cleanup(); })
    }
}

let is_new = true;
function confirm(element=null) {
    if (is_new === true) {
        const launcher_ol = document.getElementById('launcher-ol');
        const new_shortcut = document.createElement('li');
        new_shortcut.innerHTML = 
            `
                <button onclick="window.open('${url}')">
                    <img src="${new_favicon_url}" width="128" height="128"/><br><p>${name_input.value}</p>
                </button>
            `;
        launcher_ol.appendChild(new_shortcut);
    } else {
        const img = element.querySelector('img');
        const p = element.querySelector('p');
        p.innerHTML = name_input.value;
        element.setAttribute('onclick', `window.open('${getUrlFromInput()}')`);
        img.src = `${ourUrl}:8080/icon?url=${getUrlFromInput()}&size=64..128..256`;
        is_new = true;
    }
    cleanup();
}

[...document.querySelectorAll('#launcher-ol > li > button')].forEach(element => {
    element.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (new_shortcut_sec.style.display === 'flex') {
            cleanup();
        } else {
            new_shortcut_sec.style.display = 'flex';
            url_input.focus();
            is_new = false;
            document.getElementById('delete-button').style.display = 'flex';
            [...document.querySelectorAll('#buttons i')].forEach(element => {
                element.style.height = '64px';
                element.style.fontSize = '48px';
                element.style.setProperty('padding', '8px 0px');
                element.style.textAlign = 'center';
            });
            url_input.addEventListener('keydown', event => { if (event.key === 'Enter') name_input.focus() });
            name_input.addEventListener('keydown', event => { if (event.key === 'Enter') confirm(element) });
            document.getElementById('confirm-button').addEventListener('click', () => { confirm(element) });
            document.getElementById('delete-button').addEventListener('click', () => { element.parentElement.remove(); cleanup() });

            window.addEventListener('keydown', event => { if (event.key === 'Escape') cleanup() });
        }
        return false;

    })
})

