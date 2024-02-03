const usernameInput = document.getElementById("username-input")! as HTMLInputElement;
const passwordInput = document.getElementById("password-input")! as HTMLInputElement;
const submitButton = document.getElementById("submit-button")! as HTMLButtonElement;
const showPasswordButton = document.querySelector(".show-password-button")! as HTMLButtonElement;

if (!localStorage.uuid) localStorage.uuid = crypto.randomUUID();;

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

passwordInput.addEventListener("keydown", event => { if (event.key === "Enter") confirm() });
submitButton.addEventListener("click", () => { confirm() });

showPasswordButton.addEventListener("click", () => {
	if (passwordInput.getAttribute("type") === "password") {
		passwordInput.removeAttribute("type")
		document.querySelector("#show-password-button i")!.classList.replace("fa-eye", "fa-eye-slash")
	} else if (!passwordInput.getAttribute("type")) {
		passwordInput.setAttribute("type", "password")
		document.querySelector("#show-password-button i")!.classList.replace("fa-eye-slash", "fa-eye")
	}
});

async function confirm() {
	// generate UUID
	if (!localStorage.uuid) {
		localStorage.uuid = crypto.randomUUID();
	}

	if (usernameInput.value.includes(" ") || usernameInput.value.startsWith("__")) {
		if (usernameInput.value.includes(" ")) {
			usernameInput.placeholder = "spaces are not allowed!";
		} else if (usernameInput.value.includes("__")) {
			usernameInput.placeholder = "usernames are not allowed to start with '__'";
		}
		usernameInput.removeAttribute("value");
		usernameInput.style.border = "2px solid var(--col-red)";

		return;
	} // Security only includes checking for dunders and spaces in the frontend
		
	if (usernameInput.value && passwordInput.value) {
		const res = await fetch("/auth", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				password: passwordInput.value,
				username: usernameInput.value,
				uuid: localStorage.uuid,
			})
		});

		const resText = await res.text();
		if (resText && resText !== "__userinvalid") {
			window.location.assign("/");
		} else {
			passwordInput.removeAttribute("value");
			passwordInput.placeholder = "user-password pair was wrong!";
			passwordInput.style.border = "2px solid var(--col-red)";
		}
	}
}
