const rest_sec = document.getElementById('rest-sec');
const footer_sec = document.getElementById('footer-sec');
const sidebar_sec = document.getElementById('sidebar-sec');

let rest_sec_left_default
let rest_sec_width_default
let footer_sec_left_default
let is_hidden_user_choice = null
function setValues() {
    rest_sec_left_default = window.getComputedStyle(rest_sec).left;
    rest_sec_width_default = window.getComputedStyle(rest_sec).width;
    footer_sec_left_default = window.getComputedStyle(footer_sec).left;
}
setValues();

document.getElementById('menu-button').addEventListener('click', () => {
    if (is_hidden_user_choice === null) is_hidden_user_choice = true;
    if (is_hidden_user_choice === true) is_hidden_user_choice = false;
    if (is_hidden_user_choice === false) is_hidden_user_choice = true;
})

function toggleSidebarSec(mode=null, print=null) {
    if ((mode === null && sidebar_sec.hidden === false) || mode === 'hidden') {
        sidebar_sec.hidden = true;

        rest_sec.style.left = `calc(100% - ${rest_sec_width_default} - ${rest_sec_left_default} / 2)`;
        footer_sec.style.left = `calc(100% - ${rest_sec_width_default} - ${rest_sec_left_default} / 2)`;
    } else if ((mode === null && sidebar_sec.hidden === true) || mode === 'shown') {
        sidebar_sec.hidden = false;

        rest_sec.style.width = rest_sec_width_default;
        rest_sec.style.left = rest_sec_left_default;
        footer_sec.style.left = footer_sec_left_default;
        setValues();
    }
}

if (window.innerWidth <= 700) toggleSidebarSec('hidden')

window.addEventListener("resize", () => {
    rest_sec.removeAttribute('style');
    rest_sec.removeAttribute('style');
    footer_sec.removeAttribute('style');
    setValues()
    if (window.innerWidth <= 700 && is_hidden_user_choice !== false) toggleSidebarSec('hidden')
    if (window.innerWidth > 700 && is_hidden_user_choice !== true) toggleSidebarSec('shown')
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
        allow: "clipboard-read; clipboard-write"
    });

    document.getElementById("rest-sec").appendChild(new_frame);
    switch (page) {
    case 'calc':
        document.title = 'Caeborg - Calculator'; break;
    case 'chat':
        document.title = 'Caeborg - Chat'; break;
    case 'chemtools':
        document.title = 'Caeborg - ChemTools'; break;
    case 'games':
        document.title = 'Caeborg - Games'; break;
    case 'graph':
        document.title = 'Caeborg - Graph'; break;
    case 'launcher':
        document.title = 'Caeborg - Launcher'; break;
    case 'maps':
        document.title = 'Caeborg - Map'; break;
    case 'quote':
        document.title = 'Caeborg - Quote'; break;
    case 'translate':
        document.title = 'Caeborg - Translator'; break;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem('saved_frame') === null) {
        localStorage.setItem('saved_frame', 'launcher');
    } else {
        switchFrame(localStorage.getItem('saved_frame'))
    }
})
