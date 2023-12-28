const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");
const submitButton = document.getElementById("submit-button");

const showPasswordButton = document.getElementById("show-password-button");

usernameInput.addEventListener("keydown", event => {
	if (event.key === "Enter") passwordInput.focus()
});

usernameInput.oninput = () => {
	if (usernameInput.value.includes("?")) {
		usernameInput.style.border = "2px solid var(--col-red)";
	} else {
		usernameInput.style.removeProperty("border");
	}
}

if (window.location.search === "?userinvalid") {
	passwordInput.setAttribute("placeholder", "user-password pair was wrong!");
	passwordInput.removeAttribute("value");
	passwordInput.style.border = "2px solid var(--col-red)";
}

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
		res = await fetch("/auth", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: usernameInput.value,
				password: atob(passwordInput.value),
			})
		})

		const resText = await res.text()
		console.log(resText);
		if (resText !== "?userinvalid" && resText) {
			localStorage.setItem("user", resText)
			window.location.replace("/");
		} else {
			window.location.replace("/login?userinvalid");
		}
	}
}
