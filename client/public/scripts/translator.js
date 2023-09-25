let sourceLanguage = 'en';
let targetLanguage = 'nl';

languages = [
    ['Spanish', 'es'],
    ['English', 'en'],
    ['Dutch', 'nl'],
    ['German', 'de']
];

document.addEventListener('DOMContentLoaded', () => {
    const input_box = document.getElementById('input-box');
    const output_box = document.getElementById('output-box');
    const flip_button = document.getElementById('flip-button');
    const copy_button = document.getElementById('copy-button');
    input_box.focus();

    copy_button.addEventListener('click', () => {
        navigator.clipboard.writeText(output_box.value);
    });

    flip_button.addEventListener('click', async (event) => {
        [sourceLanguage, targetLanguage] = [targetLanguage, sourceLanguage];
        [input_box.value, output_box.value] = [output_box.value, input_box.value];
        let sourceLanguageFull;
        let targetLanguageFull;
        for (key of languages) {
            if (key[1] === sourceLanguage) sourceLanguageFull = key[0];
            if (key[1] === targetLanguage) targetLanguageFull = key[0];
        }
        [...document.querySelectorAll('#buttons button')].forEach(element => {
            if (element.innerHTML === sourceLanguageFull) {
                element.classList.remove('source');
                element.classList.add('target');
            } else if (element.innerHTML === targetLanguageFull) {
                element.classList.remove('target');
                element.classList.add('source');
            }
            translate();
            input_box.focus();
        });
    });

    if (localStorage.getItem('translate-input-box')) {
        console.log(input_box.value);
        input_box.value = localStorage.getItem('translate-input-box');
        translate();
    }
    
    input_box.addEventListener('keyup', async () => { await translate() });

    [...document.querySelectorAll('#buttons > button')].forEach(element => {
        element.addEventListener('click', async () => {
            document.querySelector('.source').classList.remove('source');
            element.classList.add('source');
            for (key of languages) {
                if (key[0] === element.innerHTML) sourceLanguage = key[1];
            }
            await translate();
        });
        element.addEventListener('contextmenu', async () => {
            event.preventDefault();
            document.querySelector('.target').classList.remove('target');
            element.classList.add('target');
            for (key of languages) {
                if (key[0] === element.innerHTML) targetLanguage = key[1];
            }
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
        localStorage.setItem('translate-input-box', input_box.value);
    }
});
