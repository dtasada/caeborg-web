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

newQuote();
