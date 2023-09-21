import { ourUrl } from '../env.js';

document.addEventListener("DOMContentLoaded", () => {
    const new_shortcut_sec = document.getElementById('new-shortcut-sec');
    const url_input = document.getElementById('url-input');
    const name_input = document.getElementById('name-input');
});

document.addEventListener("DOMContentLoaded", () => {
    const li = document.querySelectorAll('#launcher-ol li');
    li.forEach(liElement => {
        const img = liElement.querySelector('img');
        img.setAttribute('src', `${ourUrl}:8080/icon?url=${img.getAttribute('class')}&size=64..128..256`)
    });
})

function addShortcut() {
    new_shortcut_sec.hidden = false;
}
