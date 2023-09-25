var sourceLanguage = "en";
var targetLanguage = "nl";

languages = [
    ["Spanish", "es"],
    ["English", "en"],
    ["Dutch", "nl"],
    ["German", "de"]
];

document.addEventListener("DOMContentLoaded", () => {
    input_box = document.getElementById("input-box");
    output_box = document.getElementById("output-box");
    flip_button = document.getElementById("flip-button");
    copy_button = document.getElementById("copy-button");
    input_box.focus();

    copy_button.addEventListener("click", () => {
        // output_box.select(); 
        // output_box.setSelectionRange(0, 99999); 
        navigator.clipboard.writeText(output_box.value);
    });

    flip_button.addEventListener("click", async (event) => {
        let temp = sourceLanguage;
        sourceLanguage = targetLanguage;
        targetLanguage = temp;
        console.log(sourceLanguage, targetLanguage);
        // [sourceLanguage, targetLanguage] = [targetLanguage, sourceLanguage];
        [input_box.value, output_box.value] = [output_box.value, input_box.value];
        let sourceLanguageFull;
        let targetLanguageFull;
        for (key of languages) {
            if (key[1] === sourceLanguage) {
                sourceLanguageFull = key[0][0];
            }
            if (key[1] === targetLanguage) {
                targetLanguageFull = key[0][0];
            }
        }
        [...document.querySelectorAll("#buttons button")].forEach(async element => {
            if (element.innerHTML === sourceLanguageFull) {
                element.classList.remove("source");
                element.classList.add("target");
            } else if (element.innerHTML === targetLanguageFull) {
                element.classList.remove("target");
                element.classList.add("source");
            }
            await translate();
            input_box.focus();
        });
    });

    if (localStorage.getItem("translate-input-box")) {
        console.log(input_box.value);
        input_box.value = localStorage.getItem("translate-input-box");
        translate();
    }
    
    input_box.addEventListener("keyup", translate);

    [...document.querySelectorAll("#buttons > button")].forEach(element => {
        element.addEventListener("click", async () => {
            document.querySelector(".source").classList.remove("source");
            element.classList.add("source");
            sourceLanguage = languages[element.innerHTML];
            await translate();
        });
        element.addEventListener("contextmenu", async () => {
            event.preventDefault();
            document.querySelector(".target").classList.remove("target");
            element.classList.add("target");
            targetLanguage = languages[element.innerHTML];
            await translate();
        });
    });

    function translate(event) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURI(input_box.value)}`;
        fetch(url)
        .then(response => response.json())
        .then(data_json => {
            output_box.value = data_json[0][0][0];
        });
        localStorage.setItem("translate-input-box", input_box.value);
    }
});
