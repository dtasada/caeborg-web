const quoteButton = document.getElementById("quote-button");
const img = document.createElement("img");

quoteButton.addEventListener("click", newQuote);

async function newQuote() {
	res = await fetch("https://inspirobot.me/api?generate=true")
	img_url = await res.text()
	img.src = img_url;
	document.querySelector("body").appendChild(img);
}

newQuote();
