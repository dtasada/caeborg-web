const quoteUrl = "https://inspirobot.me/api?generate=true";

const quoteButton = document.getElementById("quote-button");
const img = document.createElement("img");

quoteButton.addEventListener("click", newQuote);
function newQuote() {
	fetch(quoteUrl)
		.then(async response => {
			const img_url = await response.text();
			img.src = img_url;
		});
	document.getElementById('images').appendChild(img);
}

const text = document.getElementById('text');
window.addEventListener('resize', () => {
	text.setAttribute('x', text.width/2)
	text.style.fontSize = text.height;
})

newQuote();
