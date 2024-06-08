function on_slider_toggle(slider_name) {
    if (document.getElementById(slider_name).checked) {
        setCookie("cookiePermissions", "cookiesEnabled", 3650)
    } else {
        setCookie("cookiePermissions", "cookiesDisabled", 3650)
    }
}

// Function to display the last visited time
function local_on_body_load() {
    var cookiePermissions = getCookie("cookiePermissions");
    if (cookiePermissions === "cookiesDisabled") {
        return;
    }

    document.getElementById("cookies-slider").checked = true;

    var lastVisitedTime = getCookie("lastVisitedTime");
    if (lastVisitedTime) {
        document.getElementById("lastVisited").textContent = "Last visited: " + lastVisitedTime;
    } else {
        document.getElementById("lastVisited").textContent = "This is your first visit!";
    }
    // Set the current time as the last visited time
    setCookie("lastVisitedTime", new Date().toLocaleString(), 365);
}

