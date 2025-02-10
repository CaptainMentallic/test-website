// handles the feedback form and sends it to a discord webhook

var webhookUrl = "process.env.DISCORD_WEBHOOK_URL";

// convert formdata to object
function formDataToObject(formData) {
    const formObject = {};
    formData.forEach((value, key) => {
        if (formObject[key]) {
            if (!Array.isArray(formObject[key])) {
                formObject[key] = [formObject[key]];
            }
            formObject[key].push(value);
        } else {
            formObject[key] = value;
        }
    });
    return formObject;
}

// get selected option from dropdown
function getSelectionData() {
    var selectElement = document.getElementById("feedback-type-select");
    var selectedIndex = selectElement.selectedIndex;
    var selectedOption = selectElement.options[selectedIndex]; // .text or .value)
    return selectedOption.text;
}

// post to discord webhook
function postToDiscord(json, isFormData = false) {
    fetch(webhookUrl, {
        method: "POST",
        headers: isFormData
            ? {}
            : {
                "Content-Type": "application/json",
            },
        body: isFormData ? json : JSON.stringify(json),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            if (text) {
                try {
                    const data = JSON.parse(text);
                    console.log("Message sent:", data);
                } catch (parseError) {
                    console.log("Message sent, but response is not valid JSON:", text);
                }
            } else {
                console.log("Message sent successfully, no content returned.");
            }
        })
        .catch(error => {
            console.error("Error sending message:", error);
        });
}

// get the users ip using a 3rd party api
async function fetchUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP:', error);
        throw error;
    }
}

// page load
document.addEventListener("DOMContentLoaded", function () {
    var popup = document.getElementById("feedback-popup");
    var form = document.getElementById("feedback-form");
    var button = document.getElementById("feedback-button");
    var closeBtn = document.querySelector(".popup .close");

    var previewContainer = document.getElementById("previewContainer");
    var fileInput = document.getElementById("fileInput");
    var pasteFrame = document.getElementById("paste-frame");

    var MAX_FILES = 10;
    var photos = [];

    var feedbackColor = 5814783;
    var bugreportColor = 16711680;

    // prevent the images from showing up in textbox when pasted
    pasteFrame.addEventListener("paste", function (event) {
        event.preventDefault();
    });

    // create image preview
    function createPreview(file) {
        if (photos.length >= MAX_FILES) {
            alert("You can only upload up to 10 files.");
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            var previewEl = document.createElement("div");
            previewEl.className = "preview";

            var img = document.createElement("img");
            img.src = e.target.result;
            previewEl.appendChild(img);

            var removeBtn = document.createElement("button");
            removeBtn.className = "remove-btn";
            removeBtn.innerHTML = "×";
            removeBtn.addEventListener("click", function () {
                previewContainer.removeChild(previewEl);
                photos = photos.filter(f => f !== file);
            });
            previewEl.appendChild(removeBtn);

            previewContainer.appendChild(previewEl);
        };
        reader.readAsDataURL(file);
        photos.push(file);
    }

    // files selected from file input
    fileInput.addEventListener("change", function (event) {
        var files = Array.from(event.target.files);
        files.forEach(file => {
            if (file.type.startsWith("image/")) {
                createPreview(file);
            }
        });
        fileInput.value = "";
    });

    // pasted images
    document.addEventListener("paste", function (event) {
        var items = (event.clipboardData || window.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.type.indexOf("image") !== -1) {
                var file = item.getAsFile();
                createPreview(file);
            }
        }
    });

    // drag & drop on pasteframe
    pasteFrame.addEventListener("dragover", function (event) {
        event.preventDefault();
        pasteFrame.classList.add("dragover");
    });

    pasteFrame.addEventListener("dragleave", function () {
        pasteFrame.classList.remove("dragover");
    });

    pasteFrame.addEventListener("drop", function (event) {
        event.preventDefault();
        pasteFrame.classList.remove("dragover");
        var files = Array.from(event.dataTransfer.files);
        files.forEach(file => {
            if (file.type.startsWith("image/")) {
                createPreview(file);
            }
        });
    });

    // click on pasteFrame to open file input
    pasteFrame.addEventListener("click", function () {
        fileInput.click();
    });

    // open feedback popup
    button.addEventListener("click", function (event) {
        event.preventDefault();
        popup.style.display = "flex";
    });

    // close feedback popup
    closeBtn.addEventListener("click", function () {
        popup.style.display = "none";
    });

    // close on outside click
    window.addEventListener("click", function (event) {
        if (event.target === popup) {
            popup.style.display = "none";
        };
    });

    // form submit
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        var formData = new FormData(form);
        var formObject = formDataToObject(formData);

        if (formObject.message.length > 1950) {
            alert("Your description is too long!");
            return;
        }

        var feedbackType = getSelectionData().toString(); // "Feedback" or "Bug Report"
        var embed = {
            title: feedbackType,
            description: formObject.message,
            color: feedbackType == "Feedback" ? feedbackColor : bugreportColor,
            footer: {
                text: "Sent from IP: " + await fetchUserIP()
            },
            timestamp: new Date().toISOString()
        };

        if (photos.length > 0 && photos[0].name) { // report includes photos
            var payload = new FormData();

            photos.forEach((file, index) => {
                if (file.name) {
                    payload.append(`file${index}`, file);
                }
            });
            payload.append("payload_json", JSON.stringify({
                content: null,
                embeds: [embed]
            }));
            postToDiscord(payload, true);
        } else { // report includes text only
            postToDiscord({
                content: null,
                embeds: [embed]
            });
        }
        // reset everything & display message
        photos = [];
        previewContainer.innerHTML = "";
        form.reset();
        popup.style.display = "none";
        alert("Feedback submitted successfully, thank you!");
    });
});