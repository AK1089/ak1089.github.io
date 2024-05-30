// Function to set a cookie
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie value
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to display the last visited time
function local_on_body_load() {
    var lastVisitedTime = getCookie("lastVisitedTime");
    if (lastVisitedTime) {
        document.getElementById("lastVisited").textContent = "Last visited: " + lastVisitedTime;
    } else {
        document.getElementById("lastVisited").textContent = "This is your first visit!";
    }
    // Set the current time as the last visited time
    setCookie("lastVisitedTime", new Date().toLocaleString(), 365);
}
