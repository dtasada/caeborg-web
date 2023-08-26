function switchFrame(page) {
	rest_section = document.getElementById("rest-sec");
	document.getElementById("rest-iframe").remove();
	new_frame = document.createElement("iframe");

	Object.assign(new_frame, {
		id: "rest-iframe",
		src: `../pages/${page}.html`,
		frameBorder: "0",
		allow: "clipboard-read; clipboard-write"
	});

	rest_section.appendChild(new_frame);

	localStorage.setItem('saved_frame', new_frame);
}

switchFrame(localStorage.getItem('saved_frame'));
