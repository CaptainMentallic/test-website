// Hides/shows navbar on scroll
// upwards scroll threshold: 100

var navbar = document.getElementById('navbar');
var prevScrollPos = window.pageYOffset;
var scrollUpThreshold = 100; // Threshold for upward scroll before showing navbar
var accumulatedScrollUp = 0;

window.addEventListener('scroll', function () {
    var currentScrollPos = window.pageYOffset;

    if (prevScrollPos > currentScrollPos || currentScrollPos < scrollUpThreshold) {
        // Scrolling up
        accumulatedScrollUp += prevScrollPos - currentScrollPos;
        if (accumulatedScrollUp > scrollUpThreshold || currentScrollPos < scrollUpThreshold) {
            navbar.style.top = "0";
            accumulatedScrollUp = 0; // Reset after showing navbar
        }
    } else {
        // Scrolling down
        navbar.style.top = "-100px";
        accumulatedScrollUp = 0; // Reset if scrolling down
    }

    prevScrollPos = currentScrollPos;
});