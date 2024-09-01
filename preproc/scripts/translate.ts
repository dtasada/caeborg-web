import { setUserSettings } from "./lib.js";

const inputBox = document.getElementById("input-box")! as HTMLInputElement;
const addButton = document.getElementById("add-button")! as HTMLButtonElement;

const dictDiv = document.getElementById("dict-div")! as HTMLDivElement;
const sourceDictBox = document.getElementById("source-dict-box") as HTMLTextAreaElement;
let translateDiv = document.getElementById("translate-div")! as HTMLDivElement;
let resizerDiv = document.getElementById("resizer-div")! as HTMLDivElement;

let sourceLanguage = "en";
let targetLanguage = "nl";
let isResizing = false;

const languages: Record<string, string> = {
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

const outputBox = document.getElementById("output-box")! as HTMLInputElement;
const flipButton = document.getElementById("flip-button")! as HTMLButtonElement;
const copyButton = document.getElementById("copy-button")! as HTMLButtonElement;
const buttonsSec = document.getElementById("buttons")!;
inputBox.focus();

// make newlangSel
const newlangSel = document.createElement("select");
newlangSel.id = "newlang-sel";
newlangSel.hidden = true;
for (const key of Object.keys(languages)) {
	let lang = document.createElement("option");
	lang.innerHTML = key;
	lang.value = key;
	newlangSel.appendChild(lang);
}
buttonsSec.insertBefore(newlangSel, copyButton);

if (localStorage.translateInputBox) inputBox.value = localStorage.translateInputBox;

copyButton.onclick = () => navigator.clipboard.writeText(outputBox.value);

addButton.onclick = async () => {
	if (newlangSel.hidden === true) {
		newlangSel.hidden = false;
		addButton.classList.replace("fa-plus", "fa-check");

		// make it the new language
		addButton.addEventListener("click", async () => {
			document.querySelector(".target")!.classList.remove("target");

			const newButton = document.createElement("button")
			newButton.classList.add("target");
			newButton.innerHTML = newlangSel.value;
			buttonsSec.insertBefore(newButton, addButton);
			Array.from(buttonsSec.getElementsByTagName("button"))
				.sort((a, b) => a.textContent!.localeCompare(b.textContent!))
				.forEach(button => buttonsSec.insertBefore(button, addButton));

			targetLanguage = languages[newlangSel.value];
			buildButtons();
			await translate();
		}, { once: true });
	} else if (newlangSel.hidden === false) {
		addButton.onclick = null
		newlangSel.hidden = true;
		addButton.classList.remove("fa-check");
		addButton.classList.add("fa-plus");
	}
};

flipButton.onclick = () => {
	[sourceLanguage, targetLanguage] = [targetLanguage, sourceLanguage];
	[inputBox.value, outputBox.value] = [outputBox.value, inputBox.value];

	document.querySelector("#buttons button.source")!.classList.replace("source", "target");
	document.querySelector("#buttons button.target")!.classList.replace("target", "source");

	translate();
	inputBox.focus();
};

inputBox.onkeyup = () => translate();

resizerDiv.onmousedown = () => isResizing = true;
document.onmousemove = (e) => {
	// fix annoying bug here (holding mouse down below min-height)
	if (!isResizing) return;

	const translateDivHeight = e.clientY - translateDiv.getBoundingClientRect().top;

	translateDiv.style.height = `${translateDivHeight}px`;
	dictDiv.style.height = `calc(100% - ${translateDivHeight + resizerDiv.clientHeight}px)`;

	document.addEventListener("mouseup", () => {
		isResizing = false;
	}, { once: true });
}

function buildButtons() {
	document.querySelectorAll("#buttons > button").forEach(element => {
		(element as HTMLButtonElement).onclick = async () => {
			document.querySelector(".source")!.classList.remove("source");
			element.classList.add("source");
			sourceLanguage = languages[element.innerHTML];
			await translate();
		};
		(element as HTMLButtonElement).oncontextmenu = async (event) => {
			event.preventDefault();
			document.querySelector(".target")!.classList.remove("target");
			element.classList.add("target");
			targetLanguage = languages[element.innerHTML];
			await translate();
		};
	});
}
buildButtons();

async function translate(source?: string, target?: string) {
	if (typeof source === "object") source = undefined
	if (source || inputBox.value) {
		const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${target ? "en" : sourceLanguage}&tl=${target ?? targetLanguage}&dt=t&q=${encodeURI(source ?? inputBox.value)}`; // Some of the worst code I've written in my life
		const res = await fetch(url);
		let dataJSON = await res.json();
		if (dataJSON[0]) {
			dataJSON = dataJSON[0][0][0];
			if (source) return dataJSON;
			else outputBox.value = dataJSON;
		} else {
			throw Error("Failed to translate.")
		}
	} else if (!inputBox.value) {
		outputBox.value = "";
		localStorage.translateInputBox = inputBox.value;
	}

	outputBox.setAttribute("placeholder", await translate("Never gonna give you up"));
	inputBox.setAttribute("placeholder", await translate("Never gonna give you up", sourceLanguage));

	let words = inputBox.value.split(" ").filter(e => e);
	if (words.length === 1 && sourceLanguage === "en") {
		dictDiv.style.display = "flex";
		resizerDiv.style.display = "flex";

		translateDiv.classList.add("dict");

		let srcDef = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${sourceLanguage}/${words[0]}`);
		sourceDictBox.innerHTML = parseDict(await srcDef.json());
	} else {
		translateDiv.classList.remove("dict");

		resizerDiv.style.display = "none";
		dictDiv.style.display = "none";
	}
}

function parseDict(json: any): string {
	let ret: any[] = [];
	json.forEach((definition: any, index: number) => {
		const { word, phonetic, phonetics, origin, meanings } = definition;

		// Start with the word and phonetic information
		let formatted = `${word}: definition ${index + 1}\n`;

		if (phonetic) formatted += `Phonetic: ${phonetic}\n`;

		// Add all available phonetics
		if (phonetics && phonetics.length > 0) {
			formatted += `Phonetics:\n`;
			phonetics.forEach((p: any, index: any) => {
				formatted += `  ${index + 1}.${p.text ? ' ' : ''}${p.text || ''}`;
				if (p.audio) {
					formatted += ` (Audio: ${p.audio})`;
				}
				formatted += `\n`;
			});
		}


		// Add origin if available
		if (origin) {
			formatted += `Origin: ${origin}\n`;
		}

		// Add meanings, part of speech, and definitions
		if (meanings && meanings.length > 0) {
			formatted += `Meanings:\n`;
			meanings.forEach((meaning: any) => {
				formatted += `  Part of Speech: ${meaning.partOfSpeech}\n`;
				meaning.definitions.forEach((definition: any, index: any) => {
					formatted += `    ${index + 1}. Definition: ${definition.definition}\n`;
					if (definition.example) {
						formatted += `       Example: ${definition.example}\n`;
					}
					if (definition.synonyms && definition.synonyms.length > 0) {
						formatted += `       Synonyms: ${definition.synonyms.join(', ')}\n`;
					}
					if (definition.antonyms && definition.antonyms.length > 0) {
						formatted += `       Antonyms: ${definition.antonyms.join(', ')}\n`;
					}
				});
			});
		}

		ret.push(formatted);
	})

	return ret.join("\n");
}
