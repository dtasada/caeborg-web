function switchFrame(page) {
	localStorage.setItem('saved_frame', page);

	document.getElementById("rest-iframe").remove();
	new_frame = document.createElement("iframe");

	Object.assign(new_frame, {
		id: "rest-iframe",
		src: `../pages/${page}.html`,
		frameBorder: "0",
		allow: "clipboard-read; clipboard-write"
	});

	document.getElementById("rest-sec").appendChild(new_frame);

}
