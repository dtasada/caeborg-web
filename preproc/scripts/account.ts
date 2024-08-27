import { setUserSettings } from "./lib.js";
setUserSettings();

let pfpContent: string;
let selectedColorScheme: string;
let selectedUserFont: string;

if (!localStorage.uuid) {
	window.location.replace("/login")
}

const backButton = document.getElementById("back-button")!;
if (window.innerWidth >= 1200) {
	backButton.style.display = "flex";
	backButton.classList.add("anim-in");
} else {
	backButton.style.display = "none"
	backButton.classList.add("anim-out");
}

window.onresize = () => {
	if (window.innerWidth >= 1200 && !backButton.classList.contains("anim-in")) {
		backButton.classList.add("anim-in");
		backButton.classList.remove("anim-out");
	} else if (window.innerWidth < 1200 && !backButton.classList.contains("anim-out")) {
		backButton.classList.add("anim-out");
		backButton.classList.remove("anim-in");
	}
};

document.querySelectorAll(".show-password-button").forEach(element => {
	(element as HTMLButtonElement).onclick = () => {
		const input = document.getElementById(`${element.id}-password-input`)!;
		const id = document.querySelector(`#${element.id}.show-password-button i`)!
		if (input.getAttribute("type") === "password") {
			input.removeAttribute("type");
			id.classList.replace("fa-eye", "fa-eye-slash");
		} else if (!input.getAttribute("type")) {
			input.setAttribute("type", "password");
			id.classList.replace("fa-eye-slash", "fa-eye");
		}
	};
});

const logoutButton = document.getElementById("logout-button")!;
const logoutDiv = document.getElementById("logout-div")!;
logoutButton.onclick = async () => {
	fetch(`/logout?uuid=${localStorage.uuid}`);
	localStorage.removeItem("uuid");
	window.location.replace("/login");
}

logoutButton.onmouseenter = () => {
	const logoutAllButton = document.getElementById("logout-all-button")!;
	logoutAllButton.style.display = "block";
	logoutAllButton.classList.add("animate");
	logoutButton.classList.add("animate");

	logoutDiv.addEventListener("mouseleave", () => {
		logoutAllButton.classList.remove("animate");
		logoutButton.classList.remove("animate");
	}, { once: true });
};

document.getElementById("save-button")!.onclick = async () => {
	if (pfpContent) {
		await fetch("/changePFP", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				content: pfpContent,
				uuid: localStorage.uuid
			})
		});
	}

	const usernameInput = document.getElementById("new-username-input")! as HTMLInputElement;
	if (usernameInput.value) {
		if (usernameInput.value.includes(" ") || usernameInput.value.startsWith("__")) {
			if (usernameInput.value.includes(" ")) {
				usernameInput.placeholder = "spaces are not allowed!";
			} else if (usernameInput.value.startsWith("__")) {
				usernameInput.placeholder = "usernames are not allowed to start with '__'";
			}

			usernameInput.value = "";
			usernameInput.style.border = "2px solid var(--col-red)";
			return;
		} // Security only includes checking for dunders and spaces in the frontend
		const res = await fetch("/changeUsername", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				uuid: localStorage.uuid,
				target: usernameInput.value
			})
		});

		const resText = await res.text();
		if (resText === "__userExists") {
			usernameInput.placeholder = "that username already exists!";
			usernameInput.value = "";
			usernameInput.style.border = "2px solid var(--col-red)";
			return;
		}
	}

	const passwordInput = document.getElementById("new-password-input") as HTMLInputElement;
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

	await fetch("/changeUserData", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			uuid: localStorage.uuid,
			colorScheme: selectedColorScheme,
			userFont: selectedUserFont,
		})
	});

	window.location.assign("/");
};

document.getElementById("discard-button")!.onclick = () => window.location.reload();

const pfpIMG = document.getElementById("pfp-img") as HTMLImageElement;
async function getPFP() {
	const res = await fetch(`/getPFP?uuid=${localStorage.uuid}`);
	pfpIMG.src = await res.text()
}
getPFP();

const pfpButton = document.getElementById("pfp-button")!;
pfpButton.onmouseover = () => {
	const i = document.getElementById("pfp-i")!;
	i.style.display = "flex";

	pfpButton.addEventListener("mouseout", () => {
		i.style.removeProperty("display");
	}, { once: true });
};

pfpButton.onclick = () => {
	const inputFile = document.createElement("input");
	inputFile.type = "file";
	inputFile.accept = ".png,.jpg,.jpeg,.avif";
	inputFile.hidden = true;

	inputFile.onchange = (event) => {
		const file = (event.target as HTMLInputElement).files![0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				pfpIMG.src = pfpContent = reader.result!.toString();
			}
			reader.readAsDataURL(file);
		}
	}
	inputFile.click();
};

async function setButtons() {
	setUserSettings();

	let themeList = document.getElementById("theme-list")! as HTMLDivElement;
	let fontList = document.getElementById("font-list")! as HTMLDivElement;

	const res = await fetch("/assets/settings.json");
	const resText = await res.text();
	let settings = JSON.parse(resText);

	// Themes
	for (let themeName of Object.keys(settings.colorSchemes)) {
		let themeButton = document.createElement("button");
		themeButton.innerHTML = themeName;
		if (localStorage.colorScheme == themeButton.innerHTML) themeButton.classList.add("active");
		themeList.append(themeButton);
	}

	// Fonts
	for (let fontName of settings.fonts) {
		let fontButton = document.createElement("button");
		fontButton.innerHTML = fontName;
		if (localStorage.userFont == fontButton.innerHTML) fontButton.classList.add("active");
		fontList.append(fontButton);
	}

	themeList.querySelectorAll("button:not(.icon)").forEach(button => {
		(button as HTMLButtonElement).onclick = () => {
			selectedColorScheme = button.innerHTML;
			document.querySelectorAll("#theme-div button").forEach(button => button.classList.remove("active"));
			button.classList.add("active")
			setUserSettings();
		}
	})

	fontList.querySelectorAll("button:not(.icon)").forEach(button => {
		(button as HTMLButtonElement).onclick = () => {
			selectedUserFont = button.innerHTML;
			document.querySelectorAll("#font-div button").forEach(button => button.classList.remove("active"));
			button.classList.add("active")
			setUserSettings();
		}
	})

	setUserSettings();
}

setButtons()
