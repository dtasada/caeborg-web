let rest_sec_left_default = null
let rest_sec_width_default = null
let footer_sec_left_default = null

function toggleSidebarSec() {
    const rest_sec = document.getElementById('rest-sec');
    const footer_sec = document.getElementById('footer-sec');
    const sidebar_sec = document.getElementById('sidebar-sec');

    if (rest_sec_left_default === null) {
        rest_sec_left_default = rest_sec.style.left;
        rest_sec_width_default = rest_sec.style.width;
        footer_sec_left_default = footer_sec.style.left;
    }

    if (sidebar_sec.hidden === false) {
        sidebar_sec.hidden = true;

        rest_sec.style.left = `calc(100% - ${rest_sec_width_default} - ${rest_sec_left_default} / 2)`;
        footer_sec.style.left = `calc(100% - ${rest_sec_width_default} - ${rest_sec_left_default} / 2)`;
    } else {
        sidebar_sec.hidden = false;

        rest_sec.style.left = rest_sec_left_default;
        footer_sec.style.left = footer_sec_left_default;

    }
}

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
