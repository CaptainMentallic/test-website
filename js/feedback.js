// handles the feedback form and sends it to a discord webhook

var webhookUrl = "process.env.DISCORD_WEBHOOK_URL";
// I know this can be easily found but it's just a webhook

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
    let photos = [];

    // prevent the images from showing up in textbox when pasted
    pasteFrame.addEventListener("paste", function(event) { 
        event.preventDefault();
    });
    
    // create image preview
    function createPreview(file) {
        if (photos.length >= MAX_FILES) {
            alert("You can only upload up to 10 files.");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewEl = document.createElement("div");
            previewEl.className = "preview";
            
            const img = document.createElement("img");
            img.src = e.target.result;
            previewEl.appendChild(img);
            
            const removeBtn = document.createElement("button");
            removeBtn.className = "remove-btn";
            removeBtn.innerHTML = "×";
            removeBtn.addEventListener("click", function() {
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
    fileInput.addEventListener("change", function(event) {
        const files = Array.from(event.target.files);
        files.forEach(file => {
            if (file.type.startsWith("image/")) {
                createPreview(file);
            }
        });
        fileInput.value = "";
    });

    // pasted images
    document.addEventListener("paste", function(event) {
        const items = (event.clipboardData || window.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf("image") !== -1) {
                const file = item.getAsFile();
                createPreview(file);
            }
        }
    });

    // drag & drop on pasteframe
    pasteFrame.addEventListener("dragover", function(event) {
        event.preventDefault();
        pasteFrame.classList.add("dragover");
    });

    pasteFrame.addEventListener("dragleave", function() {
        pasteFrame.classList.remove("dragover");
    });
    
    pasteFrame.addEventListener("drop", function(event) {
        event.preventDefault();
        pasteFrame.classList.remove("dragover");
        const files = Array.from(event.dataTransfer.files);
        files.forEach(file => {
            if (file.type.startsWith("image/")) {
                createPreview(file);
            }
        });
    });

    // click on pasteFrame to open file input
    pasteFrame.addEventListener("click", function() {
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
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var formData = new FormData(form);
        var formObject = formDataToObject(formData);

        if (formObject.message.length > 1950) {
            alert("Your description is too long!");
            return;
        }

        var feedbackType = getSelectionData().toString();
        if (photos.length > 0 && photos[0].name) { 
            var payload = new FormData();
            payload.append("payload_json", JSON.stringify({
                content: feedbackType.concat(": ", formObject.message)
            }));
            photos.forEach((file, index) => {
                if (file.name) {
                    payload.append(`file${index}`, file);
                }
            });
            
            fetch(webhookUrl, {
                method: "POST",
                body: payload
            })
            .then(response => response.json())
            .then(data => console.log("Message sent with files:", data))
            .catch(error => console.error("Error sending message:", error));
        } else { // Text only
            fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: feedbackType.concat(": ", formObject.message)
                })
            })
            .then(response => response.json())
            .then(data => console.log("Message sent:", data))
            .catch(error => console.error("Error sending message:", error));
        }

        alert("Feedback submitted successfully, thank you!");
        form.reset();
        popup.style.display = "none";
    });
});