import { ourUrl } from '../env.js';

// Launch icons
document.addEventListener("DOMContentLoaded", () => {
    const li = document.querySelectorAll('#launcher-ol li');
    li.forEach(liElement => {
        const img = liElement.querySelector('img');
        img.setAttribute('src', `${ourUrl}:8080/icon?url=${img.getAttribute('class')}&size=64..128..256`)
    });
})

// Shortcut buttons
let new_shortcut_sec;
let url_input;
let name_input;
let add_button;
let favicon_img;
document.addEventListener("DOMContentLoaded", () => {
    new_shortcut_sec = document.getElementById('new-shortcut-sec');
    url_input = document.getElementById('url-input');
    name_input = document.getElementById('name-input');
    add_button = document.getElementById('add-button');
    favicon_img = document.getElementById('favicon-img');
});

function renderFavicon() {
    if (url_input !== null || url_input !== undefined) {
        const url = url_input.value.split('://')[1]
        favicon_img.src = `${ourUrl}:8080/icon?url=${url}&size=64..128..256`
    }
}

function addShortcut() {
    if (new_shortcut_sec.style.display === 'flex') {
        new_shortcut_sec.style.display = 'none'
    } else {
        new_shortcut_sec.style.display = 'flex';
    }
}
