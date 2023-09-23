const ourUrl = window.location.href.split(/:[0-9]{4}/g)[0];

// Starting localStorage values
function startLocalStorage() {
    const launcher_sec = document.getElementById('launcher-sec');
    const launcher_ol = document.createElement('ol');
    launcher_ol.id = 'launcher-ol';
    launcher_ol.classList.add('horizontal');
    if (localStorage.getItem('saved_launcher_ol') === null) {
        console.log('if state 1');
        launcher_ol.innerHTML = 
            `
                <li><button onclick="window.open('https://hageveld.magister.net','_blank')">
                    <img src="${ourUrl}:8080/icon?url=https://hageveld.magister.net&size=64..128..256" width="128" height="128"/><br>Magister</button></li>
                <li><button onclick="window.open('https://youtube.com/', '_blank')">
                    <img src="${ourUrl}:8080/icon?url=https://youtube.com&size=64..128..256" width="128" height="128"/><br>YouTube</button></li>
            `;
        localStorage.setItem('saved_launcher_ol', launcher_ol.innerHTML);
    } else {
        console.log('if state 2');
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

function placeholderFavicon() {
    if (url_input !== null || url_input !== undefined) {
        if (url_input.value.includes('://')) url = url_input.value.split('://')[1]
        else if (url_input.value.includes('www.')) url = url_input.value.replace('www.', 'http://') 
        else url = `http://${url_input.value}`
        console.log(url);
        new_favicon_url = `${ourUrl}:8080/icon?url=${url}&size=64..128..256`
        favicon_img.src = new_favicon_url;
    }
}

function addShortcut() {
    if (new_shortcut_sec.style.display === 'flex') {
        new_shortcut_sec.style.display = 'none'
    } else {
        new_shortcut_sec.style.display = 'flex';
    }
}

function confirm() {
    const launcher_ol = document.getElementById('launcher-ol');
    const new_shortcut = document.createElement('li');
    new_shortcut.innerHTML = 
        `
            <button onclick="window.open('${url}','_blank')">
                <img src="${new_favicon_url}" width="128" height="128"/><br>${name_input.value}
            </button>
        `;
    launcher_ol.appendChild(new_shortcut);
    localStorage.setItem('saved_launcher_ol', launcher_ol.innerHTML);
}

function editShortcut() {
    
}
