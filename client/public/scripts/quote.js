const quoteUrl = "https://inspirobot.me/api?generate=true";

const quoteButton = document.getElementById("quote-button");
quoteButton.addEventListener("click", generateQuote);
const img = document.createElement("img");
document.body.appendChild(img);

function generateQuote() {
  fetch(quoteUrl)
    .then(async response => {
      const img_url = await response.text();
      img.src = img_url;
  })
}
