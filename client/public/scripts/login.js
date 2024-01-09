const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");
const submitButton = document.getElementById("submit-button");
const showPasswordButton = document.querySelector(".show-password-button");

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
	// generate UUID
	let uuid;
	if (!localStorage.uuid) {
		uuid = crypto.randomUUID();
		localStorage.uuid = uuid;
	}

	if (usernameInput.value.includes(" ") || usernameInput.value.startsWith("__")) {
		if (usernameInput.value.includes(" ")) {
			usernameInput.setAttribute("placeholder", "spaces are not allowed!");
		} else if (usernameInput.value.includes("__")) {
			usernameInput.setAttribute("placeholder", "usernames are not allowed to start with '__'");
		}
		usernameInput.removeAttribute("value");
		usernameInput.style.border = "2px solid var(--col-red)";
	}
		
	if (usernameInput.value && passwordInput.value) {
		res = await fetch("/auth", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				uuid: uuid,
				password: atob(passwordInput.value),
				username: usernameInput.value,
			})
		});

		const resText = await res.text();
		if (resText && resText !== "?userinvalid") {
			window.location.replace("/");
		} else {
			window.location.replace("/login?userinvalid");
		}
	}
}
