if (localStorage.uuid) {
	document.getElementById("logout-button").onclick = async () => {
		res = await fetch("/logout", {
			method: "POST",
			headers: { "Content-Type": "text/plain" },
			body: localStorage.uuid
		});
		res = await res.text();
		window.location.replace("/login");
	}
} else {
	window.location.replace("/login")
}

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
	inputFile.hidden = true;

	inputFile.addEventListener("change", (event) => {
		const file = event.target.files[0];
		if (file) {
			reader = new FileReader();
			reader.onload = () => {
			fetch("/newPFP", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						content: reader.result,
						uuid: localStorage.uuid
					})
				});
			}
			reader.readAsDataURL(file);
		}
	});
	inputFile.click();
});
