let input_box;
let output_box;
let sourceLanguage = 'en';
let targetLanguage = 'nl';

languages = {
    'Spanish': 'es',
    'English': 'en',
    'Dutch': 'nl',
    'German': 'de'
}

document.addEventListener('DOMContentLoaded', () => {
    input_box = document.getElementById('input-box');
    output_box = document.getElementById('output-box');
    input_box.focus();

    translate = (event) => {
        let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURI(input_box.value)}`;
        fetch(url)
        .then(response => response.json())
        .then(data_json => {
            output_box.value = data_json[0][0][0];
        });
        localStorage.setItem('translate-input-box', input_box.value);
    }

    if (localStorage.getItem('translate-input-box')) {
        input_box.value = localStorage.getItem('translate-input-box');
        translate();
    }
    
    input_box.addEventListener('keydown', translate);

    [...document.querySelectorAll('#buttons > button')].forEach(element => {
        element.addEventListener('click', async () => {
            document.querySelector('.source').classList.remove('source');
            element.classList.add('source');
            sourceLanguage = languages[element.innerHTML];
            await translate();
        });
        element.addEventListener('contextmenu', async () => {
            event.preventDefault();
            document.querySelector('.target').classList.remove('target');
            element.classList.add('target');
            targetLanguage = languages[element.innerHTML];
            await translate();
        });
    });
});
