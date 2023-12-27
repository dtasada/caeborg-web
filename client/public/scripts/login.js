const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");
const submitButton = document.getElementById("submit-button");

const showPasswordButton = document.getElementById("show-password-button");

usernameInput.addEventListener("keydown", event => { if (event.key === "Enter") passwordInput.focus() });
passwordInput.addEventListener("keydown", event => { if (event.key === "Enter") confirm() });
submitButton.addEventListener("click", () => { confirm() });

showPasswordButton.addEventListener("click", () => {
	if (passwordInput.getAttribute("type") === "password") {
		passwordInput.removeAttribute("type")
		document.querySelector("#show-password-button i").classList.replace("fa-eye", "fa-eye-slash")
	} else if (!passwordInput.getAttribute("type")) {
		passwordInput.setAttribute("type", "password")
		document.querySelector("#show-password-button i").classList.replace("fa-eye-slash", "fa-eye")
	}

});

async function confirm() {
	if (usernameInput.value && passwordInput.value) {
		console.log("here")
		console.log(atob(passwordInput.value))
		res = await fetch("/auth", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: usernameInput,
				password: atob(passwordInput.value),
			})
		})
		if (res) res = await res.json();
	}
}
