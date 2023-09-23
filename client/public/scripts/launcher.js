const ourUrl = window.location.href.split(/:[0-9]{4}/g)[0];

// Starting localStorage values
function startLocalStorage() {
    const launcher_sec = document.getElementById('launcher-sec');
    const launcher_ol = document.createElement('ol');
    if (localStorage.getItem('saved_launcher_ol') === null) {
        launcher_ol.innerHTML = 
            `<ol id="launcher-ol" class="horizontal">
                <li><button onclick="window.open('https://hageveld.magister.net','_blank')">
                    <img class="hageveld.magister.net" width="128" height="128"/><br>Magister</button></li>
                <li><button onclick="window.open('https://youtube.com/', '_blank')">
                    <img class="youtube.com" width="128" height="128"/><br>YouTube</button></li>
            </ol>`
        localStorage.setItem('saved_launcher_ol', launcher_ol.innerHTML);
    } else {
        launcher_ol.innerHTML = localStorage.getItem('saved_launcher_ol');
    }
    launcher_sec.appendChild(launcher_ol);

}

function loadFavicons() {
    const li = document.querySelectorAll('#launcher-ol li');
    li.forEach(liElement => {
        const img = liElement.querySelector('img');
        img.setAttribute('src', `${ourUrl}:8080/icon?url=${img.getAttribute('class')}&size=64..128..256`)
    });
}
startLocalStorage();
loadFavicons();

// Launch icons

// Shortcut buttons
const new_shortcut_sec = document.getElementById('new-shortcut-sec');
const url_input = document.getElementById('url-input');
const name_input = document.getElementById('name-input');
const add_button = document.getElementById('add-button');
const favicon_img = document.getElementById('favicon-img');

function placeholderFavicon() {
    if (url_input !== null || url_input !== undefined) {
        let url;
        if (url_input.value.includes('://')) url = url_input.value.split('://')[1]
        else if (url_input.value.includes('www.')) url = url_input.value.replace('www.', 'http://') 
        else  url = `http://${url_input.value}`
        favicon_img.src = `${ourUrl}:8080/icon?url=${url}&size=64..128..256`
    }
}

function addShortcut() {
    if (new_shortcut_sec.style.display === 'flex') {
        new_shortcut_sec.style.display = 'none'
    } else {
        new_shortcut_sec.style.display = 'flex';
        const launcher_ol = document.getElementById('launcher-ol');
        const new_shortcut = document.createElement('li');
        new_shortcut.innerHTML = `<li><button onclick="window.open('${url_input.value}','_blank')"><img width="128" height="128"/><br>${name_input.value}</button></li>`
        launcher_ol.appendChild(new_shortcut);
        localStorage.setItem('saved_launcher_list', launcher_ol);
    }
}
