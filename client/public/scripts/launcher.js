import { ourUrl } from '../env.js';

document.addEventListener("DOMContentLoaded", () => {
    const li = document.querySelectorAll('#launcher-ol li');
    li.forEach(liElement => {
        const img = liElement.querySelector('img');
        img.setAttribute('src', `${ourUrl}:8080/icon?url=${img.getAttribute('class')}&size=64..128..256`)
    });
})
