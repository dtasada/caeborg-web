let sourceLanguage = "en";
let targetLanguage = "nl";

const languages = {
	"Afrikaans": "af",
	"Albanian": "sq",
	"Amharic": "am",
	"Arabic": "ar",
	"Armenian": "hy",
	"Assamese": "as",
	"Aymara": "ay",
	"Azerbaijani": "az",
	"Bambara": "bm",
	"Basque": "eu",
	"Belarusian": "be",
	"Bengali": "bn",
	"Bhojpuri": "bho",
	"Bosnian": "bs",
	"Bulgarian": "bg",
	"Catalan": "ca",
	"Cebuano": "ceb",
	"Chinese (S)": "zh-CN",
	"Chinese (T)": "zh-TW",
	"Corsican": "co",
	"Croatian": "hr",
	"Czech": "cs",
	"Danish": "da",
	"Dhivehi": "dv",
	"Dogri": "doi",
	"Dutch": "nl",
	"English": "en",
	"Esperanto": "eo",
	"Estonian": "et",
	"Ewe": "ee",
	"Filipino": "fil",
	"Finnish": "fi",
	"French": "fr",
	"Frisian": "fy",
	"Galician": "gl",
	"Georgian": "ka",
	"German": "de",
	"Greek": "el",
	"Guarani": "gn",
	"Gujarati": "gu",
	"Haitian Creole": "ht",
	"Hausa": "ha",
	"Hawaiian": "haw",
	"Hebrew": "he",
	"Hindi": "hi",
	"Hmong": "hmn",
	"Hungarian": "hu",
	"Icelandic": "is",
	"Igbo": "ig",
	"Ilocano": "ilo",
	"Indonesian": "id",
	"Irish": "ga",
	"Italian": "it",
	"Japanese": "ja",
	"Javanese": "jv",
	"Kannada": "kn",
	"Kazakh": "kk",
	"Khmer": "km",
	"Kinyarwanda": "rw",
	"Konkani": "gom",
	"Korean": "ko",
	"Krio": "kri",
	"Kurdish": "ckb",
	"Kurdish": "ku",
	"Kyrgyz": "ky",
	"Lao": "lo",
	"Latin": "la",
	"Latvian": "lv",
	"Lingala": "ln",
	"Lithuanian": "lt",
	"Luganda": "lg",
	"Luxembourgish": "lb",
	"Macedonian": "mk",
	"Maithili": "mai",
	"Malagasy": "mg",
	"Malay": "ms",
	"Malayalam": "ml",
	"Maltese": "mt",
	"Maori": "mi",
	"Marathi": "mr",
	"Meiteilon": "mni-Mtei",
	"Mizo": "lus",
	"Mongolian": "mn",
	"Myanmar": "my",
	"Nepali": "ne",
	"Norwegian": "no",
	"Nyanja": "ny",
	"Odia": "or",
	"Oromo": "om",
	"Pashto": "ps",
	"Persian": "fa",
	"Polish": "pl",
	"Portuguese": "pt",
	"Punjabi": "pa",
	"Quechua": "qu",
	"Romanian": "ro",
	"Russian": "ru",
	"Samoan": "sm",
	"Sanskrit": "sa",
	"Scots Gaelic": "gd",
	"Sepedi": "nso",
	"Serbian": "sr",
	"Sesotho": "st",
	"Shona": "sn",
	"Sindhi": "sd",
	"Sinhala": "si",
	"Slovak": "sk",
	"Slovenian": "sl",
	"Somali": "so",
	"Spanish": "es",
	"Sundanese": "su",
	"Swahili": "sw",
	"Swedish": "sv",
	"Tagalog": "tl",
	"Tajik": "tg",
	"Tamil": "ta",
	"Tatar": "tt",
	"Telugu": "te",
	"Thai": "th",
	"Tigrinya": "ti",
	"Tsonga": "ts",
	"Turkish": "tr",
	"Turkmen": "tk",
	"Twi": "ak",
	"Ukrainian": "uk",
	"Urdu": "ur",
	"Uyghur": "ug",
	"Uzbek": "uz",
	"Vietnamese": "vi",
	"Welsh": "cy",
	"Xhosa": "xh",
	"Yiddish": "yi",
	"Yoruba": "yo",
	"Zulu": "zu",
};

const inputBox = document.getElementById("input-box");
const outputBox = document.getElementById("output-box");
const flipButton = document.getElementById("flip-button");
const copyButton = document.getElementById("copy-button");
const addButton = document.getElementById("add-button");
const buttonsSec = document.getElementById("buttons");
inputBox.focus();

// make newlangSel
const newlangSel = document.createElement("select");
newlangSel.id = "newlang-sel";
newlangSel.hidden = true;
for (key of Object.keys(languages)) {
	let lang = document.createElement("option");
	lang.innerHTML = key;
	lang.value = key;
	newlangSel.appendChild(lang);
}
buttonsSec.insertBefore(newlangSel, copyButton);
//

if (localStorage.translateInputBox) {
	inputBox.value = localStorage.translateInputBox;
	translate();
}

copyButton.addEventListener("click", () => navigator.clipboard.writeText(outputBox.value));

addButton.addEventListener("click", () => {
	if (newlangSel.hidden === true) {
		newlangSel.hidden = false;
		addButton.classList.remove("fa-plus");
		addButton.classList.add("fa-check");

		// make it the new language
		addButton.addEventListener("click", () => {
			document.querySelector(".target").classList.remove("target");

			const newButton = document.createElement("button")	
			newButton.classList.add("target");
			newButton.innerHTML = newlangSel.value;
			buttonsSec.insertBefore(newButton, addButton);
			Array.from(buttonsSec.getElementsByTagName("button"))
				.sort((a, b) => a.textContent.localeCompare(b.textContent))
				.forEach(button => buttonsSec.insertBefore(button, addButton));

			targetLanguage = languages[newlangSel.value];
			buildButtons();
			outputBox.setAttribute("placeholder", translate("Never gonna give you up"));
			translate();
		}, {once : true});
	} else if (newlangSel.hidden === false) {
		addButton.onclick = undefined
		newlangSel.hidden = true;
		addButton.classList.remove("fa-check");
		addButton.classList.add("fa-plus");
	}
});

flipButton.addEventListener("click", () => {
	let temp = sourceLanguage;
	sourceLanguage = targetLanguage;
	targetLanguage = temp;
	// [sourceLanguage, targetLanguage] = [targetLanguage, sourceLanguage];
	[inputBox.value, outputBox.value] = [outputBox.value, inputBox.value];
	let sourceLanguageFull;
	let targetLanguageFull;
	for (key of Object.keys(languages)) {
		if (languages[key] === sourceLanguage) sourceLanguageFull = key;
		if (languages[key] === targetLanguage) targetLanguageFull = key;
	}
	[...document.querySelectorAll("#buttons button")].forEach(async element => {
		if (element.innerHTML === sourceLanguageFull) {
			element.classList.remove("source");
			element.classList.add("target");
		} else if (element.innerHTML === targetLanguageFull) {
			element.classList.remove("target");
			element.classList.add("source");
		}
		translate();
		inputBox.focus();
	});
});

inputBox.addEventListener("keyup", translate);

function buildButtons() {
	[...document.querySelectorAll("#buttons > button")].forEach(element => {
		element.addEventListener("click", () => {
			document.querySelector(".source").classList.remove("source");
			element.classList.add("source");
			sourceLanguage = languages[element.innerHTML];
			translate();
		});
		element.addEventListener("contextmenu", (event) => {
			event.preventDefault();
			document.querySelector(".target").classList.remove("target");
			element.classList.add("target");
			targetLanguage = languages[element.innerHTML];
			translate();
		});
	});
}
buildButtons();

function translate(source=null) {
	const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${source ?? targetLanguage}&dt=t&q=${encodeURI(inputBox.value)}`;
	fetch(url)
		.then(response => response.json())
		.then(dataJSON => {
			if (dataJSON[0]) outputBox.value = dataJSON[0][0][0];
			if (source) return dataJSON[0][0][0];
	});
	localStorage.translateInputBox = inputBox.value;
	if (inputBox.value === "") outputBox.value = "";
}
