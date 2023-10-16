var sourceLanguage = "en";
var targetLanguage = "nl";

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
	"Chinese (Simplified)": "zh-CN",
	"Chinese (Traditional)": "zh-TW",
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
	"Filipino (Tagalog)": "fil",
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
	"Kurdish (Sorani)": "ckb",
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
	"Meiteilon (Manipuri)": "mni-Mtei",
	"Mizo": "lus",
	"Mongolian": "mn",
	"Myanmar (Burmese)": "my",
	"Nepali": "ne",
	"Norwegian": "no",
	"Nyanja (Chichewa)": "ny",
	"Odia (Oriya)": "or",
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
	"Tagalog (Filipino)": "tl",
	"Tajik": "tg",
	"Tamil": "ta",
	"Tatar": "tt",
	"Telugu": "te",
	"Thai": "th",
	"Tigrinya": "ti",
	"Tsonga": "ts",
	"Turkish": "tr",
	"Turkmen": "tk",
	"Twi (Akan)": "ak",
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

document.addEventListener("DOMContentLoaded", () => {
	const inputBox = document.getElementById("input-box");
	const outputBox = document.getElementById("output-box");
	const flipButton = document.getElementById("flip-button");
	const copyButton = document.getElementById("copy-button");
	const addButton = document.getElementById("add-button");
	inputBox.focus();

	// make newlang_sec
	const newlangSec = document.createElement("sec");
	newlangSec.id = "newlang-sec";
	newlangSec.hidden = true;
	for (key of Object.keys(languages)) {
		let lang = document.createElement("button");
		lang.innerHTML = key;
		newlangSec.appendChild(lang);
	}
	document.getElementById("buttons").insertBefore(newlangSec, copyButton);
	// /* */

	if (localStorage.getItem("translate-input-box")) {
		inputBox.value = localStorage.getItem("translate-input-box");
		translate();
	}

	copyButton.addEventListener("click", () => navigator.clipboard.writeText(outputBox.value));

	addButton.addEventListener("click", () => {
		if (newlangSec.hidden === true) newlangSec.hidden = false;
		else if (newlangSec.hidden === false) newlangSec.hidden = true;
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

	[...document.querySelectorAll("#buttons > button")].forEach(element => {
		element.addEventListener("click", () => {
			document.querySelector(".source").classList.remove("source");
			element.classList.add("source");
			sourceLanguage = languages[element.innerHTML];
			translate();
		});
		element.addEventListener("contextmenu", () => {
			event.preventDefault();
			document.querySelector(".target").classList.remove("target");
			element.classList.add("target");
			targetLanguage = languages[element.innerHTML];
			translate();
		});
	});

	function translate() {
		const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURI(inputBox.value)}`;
		fetch(url)
		.then(response => response.json())
			.then(data_json => {
				if (data_json[0]) outputBox.value = data_json[0][0][0];
		});
		if (inputBox.value !== '') localStorage.setItem("translate-input-box", inputBox.value);
		else outputBox.value = '';
	}
});
