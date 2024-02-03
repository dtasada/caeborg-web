const inputBox = document.getElementById("input-box")! as HTMLInputElement;
const addButton = document.getElementById("add-button")! as HTMLButtonElement;
const submit = document.getElementById("submit-button")! as HTMLButtonElement;
const outputSec = document.getElementById("output-sec")!;
const outputOl = document.getElementById("output-ol")!;

function scrollBottom() {
	outputSec.scroll({
		top: outputOl.scrollHeight,
		behavior: "smooth"
	});
}
