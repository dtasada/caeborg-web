let pfpContent;
if (!localStorage.uuid) {
	window.location.replace("/login")
}

const backButton = document.getElementById("back-button")
if (window.innerWidth >= 1200) {
	backButton.style.display = "flex";
	backButton.classList.add("anim-in");
} else {
	backButton.style.display = "none"
	backButton.classList.add("anim-out");
}
window.addEventListener("resize", () => {
	if (window.innerWidth >= 1200 && !backButton.classList.contains("anim-in")) {
		backButton.classList.add("anim-in");
		backButton.classList.remove("anim-out");
	} else if (window.innerWidth < 1200 && !backButton.classList.contains("anim-out")) {
		backButton.classList.add("anim-out");
		backButton.classList.remove("anim-in");
	}
});
backButton.addEventListener("click", () => { window.location.assign("/") });

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

const logoutButton = document.getElementById("logout-button");
const logoutDiv = document.getElementById("logout-div");
logoutButton.onclick = async () => {
	res = await fetch(`/logout?uuid=${localStorage.uuid}`);
	res = await res.text();
	localStorage.removeItem("uuid");
	window.location.replace("/login");
}

logoutButton.onmouseenter = () => {
	const logoutAllButton = document.getElementById("logout-all-button");
	logoutAllButton.style.display = "block";
	logoutAllButton.classList.add("animate");
	logoutButton.classList.add("animate");

	logoutDiv.addEventListener("mouseleave", () => {
		logoutAllButton.style.display = "none";
		logoutAllButton.classList.remove("animate");
		logoutButton.classList.remove("animate");
		}, { once: true });
};

document.getElementById("save-button").addEventListener("click", async () => {
	if (pfpContent) {
		fetch("/changePFP", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				content: pfpContent,
				uuid: localStorage.uuid
			})
		});
	}

	const usernameInput = document.getElementById("new-username-input");
	if (usernameInput.value) {
		if (usernameInput.value.includes(" ") || usernameInput.value.startsWith("__")) {
			if (usernameInput.value.includes(" ")) {
				usernameInput.placeholder = "spaces are not allowed!";
			} else if (usernameInput.value.startsWith("__")) {
				usernameInput.placeholder = "usernames are not allowed to start with '__'";
			}

			usernameInput.value = null;
			usernameInput.style.border = "2px solid var(--col-red)";
			return;
			} // Security only includes checking for dunders and spaces in the frontend
		res = await fetch("/changeUsername", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				uuid: localStorage.uuid,
				target: usernameInput.value
			})
		});

		res = await res.text();
		if (res === "__userExists") {
			usernameInput.placeholder = "that username already exists!";
			usernameInput.value = null;
			usernameInput.style.border = "2px solid var(--col-red)";
			return;
		}
	}

	const passwordInput = document.getElementById("new-password-input");
	if (passwordInput.value) {
		await fetch("/changePassword", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				uuid: localStorage.uuid,
				target: passwordInput.value
			})
		});
	}
});

document.getElementById("discard-button").addEventListener("click", () => {
	window.location.reload(true);
});

const pfpIMG = document.getElementById("pfp-img")
async function getPFP() {
	res = await fetch(`/fetchPFP?uuid=${localStorage.uuid}`);
	pfpIMG.src = await res.text()
}
getPFP();

pfpButton = document.getElementById("pfp-button")
pfpButton.addEventListener("mouseover", () => {
	const i = document.getElementById("pfp-i");
	i.style.display = "flex";

	pfpButton.addEventListener("mouseout", () => {
		i.style.display = null;
		}, { once: true });
});

pfpButton.addEventListener("click", () => {
	const inputFile = document.createElement("input");
	inputFile.type = "file";
	inputFile.accept = ".png,.jpg,.jpeg,.avif";
	inputFile.hidden = true;

	inputFile.addEventListener("change", (event) => {
		const file = event.target.files[0];
		if (file) {
			reader = new FileReader();
			reader.onload = () => {
				pfpIMG.src = pfpContent = reader.result;
			}
			reader.readAsDataURL(file);
		}
	});
	inputFile.click();
});
