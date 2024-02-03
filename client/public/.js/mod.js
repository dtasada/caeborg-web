"use strict";
const inputBox = document.getElementById("input-box");
const addButton = document.getElementById("add-button");
const submit = document.getElementById("submit-button");
const outputSec = document.getElementById("output-sec");
const outputOl = document.getElementById("output-ol");
function scrollBottom() {
    outputSec.scroll({
        top: outputOl.scrollHeight,
        behavior: "smooth"
    });
}
