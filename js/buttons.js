// Button click handler

// Theme buttons
var themes = {
    yellow: {
        main: "#FFD700",
        secondary: "#ffffff",
        tertiary: "#bbb"
},
    purple: {
        main: "#5929e5",
        secondary: "#ffffff",//"#fddfdf"
        tertiary: "#fddfdf"
    }
};

var yellowThemeChange = document.getElementById("yellow-theme-change");
var purpleThemeChange = document.getElementById("purple-theme-change");

// change css variables and save theme to local storage
function changeTheme(themeName) {
    var theme = themes[themeName];
    document.documentElement.style.setProperty('--main-color', theme.main);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--tertiary-color', theme.tertiary);

    localStorage.setItem('theme', themeName);
}

yellowThemeChange.addEventListener("click", () => changeTheme("yellow"));
purpleThemeChange.addEventListener("click", () => changeTheme("purple"));

document.addEventListener("DOMContentLoaded", function() {
    var theme = localStorage.getItem('theme');
    if (theme == "yellow" || theme == "purple") {
        changeTheme(theme);
    }
});