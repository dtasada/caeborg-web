const rest_sec_left_default = document.getElementById('rest-sec').style.left;
const footer_sec_left_default = document.getElementById('rest-sec').style.left;
function toggleSidebarSec() {
    if (document.getElementById('sidebar-sec').hidden == false) {
        document.getElementById('sidebar-sec').hidden = true;

        document.getElementById('rest-sec').style.left = rest_sec_left_default / 2;
        document.getElementById('footer-sec').style.left = footer_sec_left_default / 2;
    } else {
        document.getElementById('sidebar-sec').hidden = false;

        document.getElementById('rest-sec').style.left = rest_sec_left_default;
        document.getElementById('footer-sec').style.left = footer_sec_left_default;

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
