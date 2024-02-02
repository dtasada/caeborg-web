const quoteButton = document.getElementById("quote-button");
const img = document.createElement("img");
quoteButton.addEventListener("click", newQuote);
async function newQuote() {
    const res = await fetch("https://inspirobot.me/api?generate=true");
    const imgURL = await res.text();
    img.src = imgURL;
    document.querySelector("body").appendChild(img);
}
newQuote();
export {};
