const rest_sec = document.getElementById('rest-sec');
const footer_sec = document.getElementById('footer-sec');
const sidebar_sec = document.getElementById('sidebar-sec');

let rest_sec_left_default
let rest_sec_width_default
let footer_sec_left_default
function setValues() {
    rest_sec_left_default = window.getComputedStyle(rest_sec).left;
    rest_sec_width_default = window.getComputedStyle(rest_sec).width;
    footer_sec_left_default = window.getComputedStyle(footer_sec).left;
}
setValues();

function toggleSidebarSec(mode=null) {
    if (sidebar_sec.hidden === false || mode === 'hidden') {
        console.log('switching to hidden')
        sidebar_sec.hidden = true;

        rest_sec.style.left = `calc(100% - ${rest_sec_width_default} - ${rest_sec_left_default} / 2)`;
        footer_sec.style.left = `calc(100% - ${rest_sec_width_default} - ${rest_sec_left_default} / 2)`;
    } else if (sidebar_sec.hidden === true || mode === 'shown') {
        console.log('switching to shown')
        sidebar_sec.hidden = true;
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
    if (window.innerWidth <= 700) toggleSidebarSec('hidden')
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
}


document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem('saved_frame') === null) {
        localStorage.setItem('saved_frame', 'launcher');
    } else {
        switchFrame(localStorage.getItem('saved_frame'))
    }
})
