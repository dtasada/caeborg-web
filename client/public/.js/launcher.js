"use strict";
const newShortcutSec = document.getElementById("new-shortcut-sec");
const launcherSec = document.getElementById("launcher-sec");
const urlInput = document.getElementById("url-input");
const nameInput = document.getElementById("name-input");
const faviconIMG = document.getElementById("favicon-img");
const confirmButton = document.getElementById("confirm-button");
const deleteButton = document.getElementById("delete-button");
let newFaviconURL;
let url;
let isNew;
let obj;
function getUrlFromInput() {
    let val = urlInput.value;
    if (val.startsWith('http://') || val.startsWith('https://')) {
        return val;
    }
    else {
        return `https://${val}`;
    }
}
// Generating shortcuts on startup
function makeTitle(text) {
    launcherSec.style.setProperty("justify-content", "center");
    launcherSec.style.setProperty("align-items", "center");
    const h = document.createElement("h1");
    h.classList.add("title");
    h.style.setProperty("color", "var(--col-subtext)");
    h.innerHTML = text;
    launcherSec.appendChild(h);
}
async function genShortcuts() {
    if (document.querySelector("launcher-ol")) {
        document.querySelector("launcher-ol").remove();
        document.querySelector("launcher-sec").remove();
    }
    let launcherOl;
    const res = await fetch(`/fetchLauncher?uuid=${localStorage.uuid}`);
    const resText = await res.text();
    if (resText !== "__userinvalid") {
        obj = JSON.parse(resText);
        launcherOl = document.createElement("ol");
        launcherOl.id = "launcher-ol";
        launcherOl.classList.add("horizontal");
    }
    else {
        makeTitle("Please sign in to use the launcher");
        addButton.setAttribute("disabled", "true");
        return;
    }
    if (Object.keys(obj).length === 0) {
        makeTitle("Your launcher is empty!<br>You can add shortcuts with<br>the bottom right button.");
        return;
    }
    for (const key of Object.keys(obj)) {
        const li = document.createElement("li");
        url = obj[key];
        li.innerHTML = `<button onclick="window.open('${url}')">
			<img src="/icon?url=${url}&size=64..128..256" width="128" height="128"/><br><p>${key}</p></button>`;
        launcherOl.appendChild(li);
    }
    launcherSec.appendChild(launcherOl);
    document.querySelectorAll("#launcher-ol > li > button").forEach(element => {
        if (document.location.search === "?newTabDash") {
            const oldClick = element.getAttribute("onclick");
            element.setAttribute("onclick", oldClick.replace(/window.open(.*.)/, "window.parent.location.href=$1"));
        }
        element.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            if (newShortcutSec.style.display === "flex") {
                cleanup();
            }
            else {
                newShortcutSec.style.display = "flex";
                nameInput.value = element.querySelector("p").innerHTML;
                urlInput.value = element.getAttribute("onclick").split("'")[1];
                faviconIMG.src = element.querySelector("img").src;
                placeholderFavicon();
                nameInput.focus();
                confirmButton.classList.add("half");
                deleteButton.classList.add("half");
                eventHandler(element);
            }
        });
    });
}
genShortcuts();
// Functions for repetition
async function cleanup() {
    urlInput.value = "";
    nameInput.value = "";
    faviconIMG.style.opacity = "0";
    newShortcutSec.style.display = "none";
    confirmButton.classList.remove("half");
    deleteButton.classList.remove("half");
    await fetch("/postLauncher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            uuid: localStorage.uuid,
            object: JSON.stringify(obj),
        })
    });
    location.reload();
    isNew = true;
    genShortcuts();
}
function eventHandler(element) {
    nameInput.focus();
    nameInput.addEventListener("keydown", event => { if (event.key === "Enter")
        urlInput.focus(); });
    window.addEventListener("keydown", event => { if (event.key === "Escape")
        cleanup(); });
    if (element) {
        isNew = false;
        deleteButton.addEventListener("click", () => { delete obj[element.parentElement.querySelector("p").innerHTML]; cleanup(); });
        urlInput.addEventListener("keydown", event => { if (event.key === "Enter")
            confirmAll(element); });
        confirmButton.addEventListener("click", () => confirmAll(element));
    }
    else {
        isNew = true;
        urlInput.addEventListener("keydown", event => { if (event.key === "Enter")
            confirmAll(); });
        confirmButton.addEventListener("click", () => { confirmAll(); });
    }
}
function placeholderFavicon() {
    if (urlInput !== null && urlInput !== undefined) {
        faviconIMG.style.opacity = "1";
        if (urlInput.value === "") {
            faviconIMG.style.opacity = "0";
            return;
        }
        url = getUrlFromInput();
        newFaviconURL = `/icon?url=${url}&size=64..128..256`;
        faviconIMG.src = newFaviconURL;
    }
}
// Real functional functions
function confirmAll(element) {
    if (isNew === false) {
        delete obj[element.querySelector("p").innerHTML];
    }
    obj[nameInput.value] = getUrlFromInput();
    cleanup();
}
