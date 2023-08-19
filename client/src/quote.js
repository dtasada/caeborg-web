quoteUrl = "https://inspirobot.me/api?generate=true";

var quoteButton = document.getElementById("quote-button");
quoteButton.addEventListener("click", generateQuote);
var img = document.createElement("img");
document.getElementById("body").appendChild(img);

function generateQuote () {
    fetch(quoteUrl)
      .then(async res => {
        let img_url = await res.text();
        img.src = img_url;
    })
}
