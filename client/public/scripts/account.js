[...document.querySelectorAll(".show-password-button")].forEach(element => {
	element.addEventListener("click", () => {
		const input = document.getElementById(`${element.id}-password-input`);
		if (input.getAttribute("type") === "password") {
			input.removeAttribute("type")
			document.querySelector(`#${element.id}.show-password-button i`).classList.replace("fa-eye", "fa-eye-slash")
		} else if (!input.getAttribute("type")) {
			input.setAttribute("type", "password")
			document.querySelector(`#${element.id}.show-password-button i`).classList.replace("fa-eye-slash", "fa-eye")
		}
	});
});

document.getElementById("save-button").addEventListener("click", () => {
	document.querySelector("#old.show-password-button").style.display = "flex";
	document.getElementById("old-password-input").hidden = false;
	document.getElementById("old-password-input").classList.add("animate");
});
