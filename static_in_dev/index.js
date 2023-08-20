/* Drag and drop files */
var isAdvancedUpload = function() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

var CORRECT_FORM_ERROR_MESSAGE = "Please correct the errors in the form";

let draggableFileArea = document.querySelector(".drag-file-area");
let browseFileText = document.querySelector(".browse-files");
let uploadIcon = document.querySelector(".upload-icon");
let dragDropText = document.querySelector(".dynamic-message");
var fileInput = document.querySelector(".default-file-input");
let cannotUploadMessage = document.querySelector(".cannot-upload-message");
let cannotLeaveFieldBlank = document.querySelector(".error-span");
let cancelAlertButtonForFileInput = document.querySelector(".cancel-alert-button-file");
let cancelAlertButtonForTextInput = document.querySelector(".cancel-alert-button-text")
let uploadedFile = document.querySelector(".file-block");
let fileName = document.querySelector(".file-name");
let fileSize = document.querySelector(".file-size");
let progressBar = document.querySelector(".progress-bar");
let removeFileButton = document.querySelector(".remove-file-icon");
let uploadButton = document.querySelector(".upload-button");
let textConvertButton = document.querySelector(".convert-entered-text-btn");
let fileFlag = 0;

let MAX_UPLOAD_SIZE_IN_MB = 50;
let ONE_MB_IN_BYTES = 1000 * 1000;
let MAX_UPLOAD_SIZE_IN_BYTES = MAX_UPLOAD_SIZE_IN_MB * ONE_MB_IN_BYTES;
let MAX_UPLOAD_SIZE = fileSizeFormat(MAX_UPLOAD_SIZE_IN_BYTES);

function fileSizeFormat(bytes) {
    try {
        bytes = parseInt(bytes);
    } catch (error) {
        return '0 bytes';
    }

    function filesize_number_format(value) {
        return (Math.round(value * 10) / 10).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }

    const KB = 1000;
    const MB = 1000000;
    const GB = 1000000000;
    const TB = 1000000000000;
    const PB = 1000000000000000;

    const negative = bytes < 0;
    if (negative) {
        bytes = -bytes;  // Allow formatting of negative numbers.
    }

    if (bytes < KB) {
        return `${bytes} byte${bytes !== 1 ? 's' : ''}`;
    } else if (bytes < MB) {
        return `${filesize_number_format(bytes / KB)} KB`;
    } else if (bytes < GB) {
        return `${filesize_number_format(bytes / MB)} MB`;
    } else if (BigInt(bytes) < TB) {
        return `${filesize_number_format(Number(BigInt(bytes) / TB))} GB`;
    } else if (BigInt(bytes) < PB) {
        return `${filesize_number_format(Number(BigInt(bytes) / PB))} TB`;
    } else {
        return `${filesize_number_format(Number(BigInt(bytes) / PB))} PB`;
    }
}


function resetFileUploadForm(fileInputField) {
    if (fileInputField) {
        fileInputField.value = '';
        fileInput = fileInputField;
        uploadedFile.style.cssText = "display: none;";
        uploadIcon.innerHTML = 'file_upload';
        dragDropText.innerHTML = 'Drag & drop any file here';
        document.querySelector(".label").innerHTML = `or <span class="browse-files"><input name="file_to_convert" accept=".txt,.docx,.pdf" type="file" class="default-file-input"/><span class="browse-files-text"> browse file </span><span>from device</span></span>`;
        uploadButton.innerHTML = `Upload`;
    }
}

document.addEventListener("click", function(e) {
    const target = e.target.closest(".default-file-input");
    resetFileUploadForm(target);
});

document.body.addEventListener('change', function(event) {
    if (event.target.className == 'default-file-input') {
        fileInput = event.target;
        const nameOfFile = fileInput.files[0].name
        const nameOfFileLowercased = nameOfFile.toLowerCase();
        if (!(nameOfFileLowercased.endsWith('.txt') || nameOfFileLowercased.endsWith('.docx') || nameOfFileLowercased.endsWith('.pdf'))) {
            fileFlag = 1;
            fileInput.value = '';
            cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
            document.querySelector('.select-file-text').textContent = "Please upload only .txt, .docx or .pdf files";
            showNotification(CORRECT_FORM_ERROR_MESSAGE);
            return
        }

        if (fileInput.files[0].size > MAX_UPLOAD_SIZE_IN_BYTES) {
            fileFlag = 1;
            cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
            document.querySelector('.select-file-text').textContent = "Please keep file size under " + MAX_UPLOAD_SIZE + ". Current filesize: " + fileSizeFormat(fileInput.files[0].size);
            showNotification(CORRECT_FORM_ERROR_MESSAGE);
            fileInput.value = '';
            return
        }

        uploadIcon.innerHTML = 'check_circle';
        dragDropText.innerHTML = 'File Dropped Successfully!';
        document.querySelector(".label").innerHTML = `Drag & drop or <span class="browse-files"><input type="file" class="default-file-input" accept=".txt,.docx,.pdf" name="file_to_convert" style=""/><span class="browse-files-text">browse file</span></span>`;
        uploadButton.innerHTML = `Upload`;
        fileName.innerHTML = nameOfFile;
        fileSize.innerHTML = fileSizeFormat(fileInput.files[0].size);
        uploadedFile.style.cssText = "display: flex;";
        progressBar.style.width = 0;
        fileFlag = 0;

    };
});

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('cancel-alert-button-remove')) {
        handleRemoveButtonClick(event);
    }
});


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function appendErrorSpan(fieldName, formErrors) {
    const fieldErrorName = `${fieldName}_errors`;
    const fieldErrors = formErrors[fieldErrorName];

    if (fieldErrors.length !== 0) {
        const divSurroundingElement = document.querySelector(`.${fieldName}`);

        const errorSpan = document.createElement('span');
        errorSpan.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";

        fieldErrors.forEach((error) => {
            const errorContent = `
        <span class="error-span-main-wrap">
            <span class="material-icons-outlined">error</span>
            <p>${error}</p>
        </span>
        <span class="material-icons-outlined cancel-alert-button-remove">cancel</span>`;
            errorSpan.innerHTML += errorContent;
        });

        errorSpan.className = 'small-error-span error-span';
        if (fieldName === 'voice_accent_form' || fieldName === 'choose_lang_form') {
            divSurroundingElement.appendChild(errorSpan);
            const inputField = divSurroundingElement.querySelector("input");
            inputField.classList.add("error-border");
        } else if (fieldName === 'file_upload_form') {
            errorSpan.className = 'error-span file-upload-error-span';
            var dragFileArea = document.querySelector(".drag-file-area");
            dragFileArea.parentNode.insertBefore(errorSpan, dragFileArea.nextSibling);
        } else if (fieldName === 'text_input_form') {
            const container = divSurroundingElement.querySelector(".container");
            container.classList.add("error-border");
            container.parentElement.insertAdjacentElement('afterend', errorSpan);
        }

    }
}


function handleRemoveButtonClick(event) {
    const removeButton = event.target;
    const errorSpan = removeButton.parentNode;

    let adjacentElement = errorSpan.previousElementSibling;

    // Traverse until an element with an input field is found
    while (adjacentElement && !adjacentElement.querySelector('input')) {
        adjacentElement = adjacentElement.previousElementSibling;
    }

    if (adjacentElement) {
        const errorBorderElement = adjacentElement.querySelector('.error-border');
        if (errorBorderElement) {
            errorBorderElement.classList.remove('error-border');
        }
    }

    errorSpan.parentNode.removeChild(errorSpan);
}


function removeAllErrorIndicators() {
    // Remove the error notification if it exists
    const notificationDiv = document.getElementById("notification-div");
    if (notificationDiv) {
        notificationDiv.remove();
    }

    // Remove all red borders surrounding elements
    const errorElements = document.querySelectorAll(".error-border");
    errorElements.forEach((element) => {
        element.classList.remove("error-border");
    });

    // Hide error spans that were added statically i.e. already in DOM on page load
    cannotUploadMessage.style.cssText = "display: none;";
    cannotLeaveFieldBlank.style.cssText = "display: none;";

    // Remove error spans that were added dynamically with js
    const cancelButtons = document.querySelectorAll('.cancel-alert-button-remove');
    cancelButtons.forEach((cancelButton) => {
        const errorSpan = cancelButton.parentNode;
        errorSpan.parentNode.removeChild(errorSpan);
    });
}

function showNotification(message, type='error') {
    const notification = document.getElementById("notification");

    const existingNotificationDiv = document.getElementById("notification-div");
    if (existingNotificationDiv) {
        notification.removeChild(existingNotificationDiv);
    }
    
    const newNotificationDiv = document.createElement("div");
    newNotificationDiv.id = "notification-div";
    
    const className = type === 'error' ? 'error-span' : 'success-span';
    
    const spanElem = document.createElement('span');
    spanElem.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
    spanElem.className = className;
    
    const icon = type === 'error' ? 'error' : 'check_circle';
    const spanContent = `<span class="error-span-main-wrap">
    <span class="material-icons-outlined">${icon}</span>
    <p>${message}</p>
    </span>
    <span class="material-icons-outlined cancel-alert-button-remove">cancel</span>`;
    
    spanElem.innerHTML = spanContent;
    newNotificationDiv.appendChild(spanElem);
    notification.appendChild(newNotificationDiv);
}


function toggleContent() {
    var mainContent = document.querySelector('.main-content-wrapper');
    var dynamicContent = document.querySelector('.dynamic-content-wrapper');
    
    if (mainContent.style.display === 'none') {
        dynamicContent.innerHTML = '';
        dynamicContent.style.display = 'none';
        mainContent.style.display = 'flex';
        fileInputField = document.querySelector(".default-file-input");
        resetFileUploadForm(fileInputField);
    } else {
        mainContent.style.display = 'none';
        dynamicContent.style.display = 'flex';
    }
    toggleBackButton();
}

async function uploadToServer(elementName, objectToUpload, csrftoken, url, lang, accent) {
    let formData = new FormData();
    formData.append(elementName, objectToUpload);
    formData.append('select_lang', lang);
    formData.append('select_voice_accent', accent);
    await fetch(url, {
            body: formData,
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest', //  Necessary to work with request.is_ajax()
                'X-CSRFToken': csrftoken,
            },
        })
        .then(response => {
            if (response.ok) {
                return response.json(); //  Convert response to JSON
            }
            return Promise.reject(response); // reject instead of throw
        })
        .then(data => {
            // Perform actions with the response data from the view
            if (!data.context.errors) {
                document.querySelector('.dynamic-content-wrapper').innerHTML = data.html;
                toggleContent();
                const abortTaskUrl = data.context.abort_task_url;
                abortButton = document.querySelector('.abort-button');
                abortButton.addEventListener('click', () => {
                    abortTask(abortTaskUrl);
                });
                const backButton = document.querySelector('.return-div');
                backButton.classList.add("abort-task");  
                backButton.setAttribute('data-abort-task-url', abortTaskUrl);              
                checkTaskProgress(data.context.get_progress_url);
            } else {
                showNotification(CORRECT_FORM_ERROR_MESSAGE);

                // Append errors to form fields
                const formErrors = data.context.form_errors;
                const formFields = ['voice_accent_form', 'choose_lang_form'];

                if ('file_upload_form_errors' in data.context.form_errors) {
                    formFields.push('file_upload_form')
                } else if ('text_input_form_errors' in data.context.form_errors) {
                    formFields.push('text_input_form')
                }

                formFields.forEach((fieldName) => {
                    appendErrorSpan(fieldName, formErrors);
                });                
            }
        })
        .catch((response) => {
            console.log("response status: ", response.status);
            console.log("response status text: ", response.statusText)

            const error_msg = ["An error occured while trying to communicate with the server.",
                "Sorry about that. Please try again."
            ];
            
            toggleContent();
            displayError(error_msg);

        });;
}

function checkTaskProgress(url) {
    var interval = setInterval(function() {
        fetch(url)
            .then(function(response) {
                if (response.ok) {
                    return response.json();
                } else {
                    clearInterval(interval);
                    displayError(['An error occurred while checking task progress.']);
                }
            })
            .then(function(data) {
                if (data.task_completed) {
                    clearInterval(interval);
                    if (data.success) {                        
                        if (data.context.aborted) {
                            return
                        } 
                        document.querySelector(".dynamic-content-wrapper").innerHTML = data.html;  
                        initializeAudioPlayer();
                        backButtonDoNotAbort(); //  Do not abort task since task has already ended and ended successfully.
                    } else {
                        displayError(data.context.errors);                        
                    }
                } else {
                    if ((data.errors.length) === 0) {
                        const percentage = Math.floor(data.progress);
                        const progress = document.querySelector('.progress-done');
                        progress.textContent = `${percentage}%`;
                        progress.style.width = `${percentage}%`;
                        progress.style.opacity = 1;                        
                    } else {
                        displayError(data.errors);
                        clearInterval(interval);
                    }
                }
            })
            .catch(function(response) {
                clearInterval(interval);
                console.log("response status: ", response.status);
                console.log("response status text: ", response.statusText)

                const error_msg = ["An error occured while trying to communicate with the server.",
                    "Sorry about that. Please try again."
                ];
                displayError(error_msg);

            });
    }, 1000);
}

function abortTask(url) {
    fetch(url)
    .then(function(response) {
        if (response.ok) {
            return response.json();
        } else {
            displayError(['An error occurred while aborting the task.']);
        }
    })
    .then(function(data) {
        if (data.errors.length === 0) {
            toggleContent();
            showNotification(data.message, 'success');
        } else {
            displayError(data.errors);
        }
        
    })
    .catch(function(response) {
        console.log("response status: ", response.status);
        console.log("response status text: ", response.statusText)

        const error_msg = ["An error occured while trying to communicate with the server.",
            "Sorry about that. Please try again."
        ];
        displayError(error_msg);

    });    
}

function backButtonDoNotAbort() {
    const backButton = document.querySelector('.return-div');
    if (backButton && backButton.classList.contains('abort-task')) {
        backButton.classList.remove('abort-task');
    }
}

window.addEventListener("beforeunload", function() {
    const backButton = document.querySelector('.return-div');
    if (backButton && backButton.classList.contains('abort-task')) {
        const abortTaskUrl = backButton.getAttribute('data-abort-task-url');
        fetch(abortTaskUrl, {
            method: "GET",        
            keepalive: true //  to keep request open when this page is terminated.
        });
    }
});

function startErrorAnimation() {
    document.querySelector(".dynamic-content-wrapper").innerHTML = `<!-- Simple error animation, credits to https://codepen.io/bmartin97/pen/yLYOKVM 
    -->
    <div class="div-wrapper-for-loaded-content">
      <div class="error-container">
          <div class="circle-border"></div>
          <div class="circle">
              <div class="error"></div>            
          </div>
      </div>
    </div>
    `
}

function toggleBackButton() {
    const backButton = document.querySelector('.return-div');
    if (backButton) {
        backButton.remove();
    } else {
        var header = document.querySelector("header")
        var spanElem = document.createElement("span");
        spanElem.className = "return-div";
        spanElem.innerHTML = `<a id="return-button" title="Back" class="close"><svg id="return-arrow" class="fa-solid fa-arrow-left-long" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M109.3 288L480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288z"/></svg><p>Return</p></a>`;
        header.parentNode.insertBefore(spanElem, header.nextSibling);
        spanElem.addEventListener("click", () => {
            if (spanElem.classList.contains('abort-task')) {
                const abortTaskUrl = spanElem.getAttribute('data-abort-task-url');
                abortTask(abortTaskUrl);
            } else {
                toggleContent();
            }
        });
    }
}

function displayError(errorList) {
    
    backButtonDoNotAbort(); //  Do not abort task if error has occured as task has already ended.

    startErrorAnimation();
    const errorContainer = document.querySelector(".error-container");
    const errorDiv = document.createElement("div");
    var pElems = ``

    for (let i = 0; i < errorList.length; i++) {
        pElems += `<p class="single-error">${errorList[i]}</p>`
    }

    errorDiv.innerHTML = pElems;
    errorContainer.parentNode.insertBefore(errorDiv, errorContainer.nextSibling);
}

const csrftoken = getCookie('csrftoken');

uploadButton.addEventListener("click", () => {
    removeAllErrorIndicators();
    let isFileUploaded = fileInput.value;
    if (isFileUploaded != '') {
        if (fileFlag == 0) {
            fileFlag = 1;
            var width = 0;
            var id = setInterval(frame, 50);

            function frame() {
                if (width >= 350) {
                    clearInterval(id);
                    uploadButton.innerHTML = `<span class="material-icons-outlined upload-button-icon"> check_circle </span> Uploaded`;
                } else {
                    width += 5;
                    progressBar.style.width = width + "px";
                }
            }
            const lang = document.querySelector("#selectLangList").value;
            const accent = document.querySelector("#selectVoiceAccentList").value;

            uploadToServer('file_to_convert', fileInput.files[0], csrftoken, '/convert_file_content', lang, accent)
        }
    } else {
        document.querySelector('.select-file-text').textContent = " Please select a file first ";
        cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
        showNotification(CORRECT_FORM_ERROR_MESSAGE);
    }
});

textConvertButton.addEventListener("click", () => {
    removeAllErrorIndicators();
    let textToConvert = document.querySelector(".text").value.trim();

    if (textToConvert.length !== 0) {
        const lang = document.querySelector("#selectLangList").value;
        const accent = document.querySelector("#selectVoiceAccentList").value;

        uploadToServer('text_to_convert', textToConvert, csrftoken, '/convert_input_text', lang, accent)
    } else {
        cannotLeaveFieldBlank.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
        const container = document.querySelector(".text").closest(".container");
        container.classList.add("error-border");
        showNotification(CORRECT_FORM_ERROR_MESSAGE);
    }

});


cancelAlertButtonForFileInput.addEventListener("click", () => {
    cannotUploadMessage.style.cssText = "display: none;";
});

cancelAlertButtonForTextInput.addEventListener("click", () => {
    cannotLeaveFieldBlank.style.cssText = "display: none;";
    const adjacentElement = cannotLeaveFieldBlank.previousElementSibling;
    const errorBorderElement = adjacentElement.querySelector('.error-border');

    if (errorBorderElement) {
        errorBorderElement.classList.remove('error-border');
    }
});

if (isAdvancedUpload) {
    ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach(evt =>
        draggableFileArea.addEventListener(evt, e => {
            e.preventDefault();
            e.stopPropagation();
        })
    );

    ["dragover", "dragenter"].forEach(evt => {
        draggableFileArea.addEventListener(evt, e => {
            e.preventDefault();
            e.stopPropagation();
            uploadIcon.innerHTML = 'file_download';
            dragDropText.innerHTML = 'Drop your file here!';
        });
    });

    draggableFileArea.addEventListener("drop", e => {

        let files = e.dataTransfer.files;
        fileInput.files = files;

        nameOfFile = files[0].name;
        nameOfFileLowercased = nameOfFile.toLowerCase();

        if (!(nameOfFileLowercased.endsWith('.txt') || nameOfFileLowercased.endsWith('.docx') || nameOfFileLowercased.endsWith('.pdf'))) {
            fileFlag = 1;
            fileInput.value = '';
            cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
            document.querySelector('.select-file-text').textContent = "Please upload only .txt, .docx or .pdf files";
            showNotification(CORRECT_FORM_ERROR_MESSAGE);
            return
        }

        if (files[0].size > MAX_UPLOAD_SIZE_IN_BYTES) {
            fileFlag = 1;
            cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
            document.querySelector('.select-file-text').textContent = "Please keep file size under " + MAX_UPLOAD_SIZE + ". Current filesize: " + fileSizeFormat(files[0].size);
            showNotification(CORRECT_FORM_ERROR_MESSAGE);
            fileInput.value = '';
            return
        }

        uploadIcon.innerHTML = 'check_circle';
        dragDropText.innerHTML = 'File Dropped Successfully!';
        document.querySelector(".label").innerHTML = `Drag & drop or <span class="browse-files"><input name="file_to_convert" accept=".txt,.docx,.pdf" type="file" class="default-file-input" style=""/><span class="browse-files-text" style="top: -23px;">browse file</span></span>`;
        uploadButton.innerHTML = `Upload`;

        fileName.innerHTML = nameOfFile;
        fileSize.innerHTML = fileSizeFormat(files[0].size);
        uploadedFile.style.cssText = "display: flex;";
        progressBar.style.width = 0;
        fileFlag = 0;


    });
}

removeFileButton.addEventListener("click", () => {
    resetFileUploadForm(document.querySelector(".default-file-input"));
});

/* Drag and drop files */

function query(a) {
    return document.querySelector(a);
}

function queryAll(a) {
    return document.querySelectorAll(a);
}


let clear = query(".clear");
let text = query(".text");


clear.onclick = function() {
    text.value = "";
}


function initializeAudioPlayer() {
    // Media player

    const speak_div = document.querySelector(".play div");
    const backButton = document.getElementById("back-button");
    const playerArea = document.getElementById("mediaPlayer");
    const playButton = document.getElementById("playState");
    const stopButton = document.getElementById("stopItem");
    const durationLabel = document.getElementById("currentDuration");
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.volume = 0.5;
    const volumeSlider = document.getElementById("volumeSlider");
    let dataAvailable = false;
    let currentLength;
    let timer;

    timer = setInterval(updateDurationLabel, 100);

    volumeSlider.addEventListener("input", () => {
        audioPlayer.volume = parseFloat(volumeSlider.value);
    }, false);


    const playMusic = () => {
        playerArea.classList.toggle("play");       
        
        if (audioPlayer.paused) {
            setTimeout(()=> {audioPlayer.play()}, 300)
            timer = setInterval(updateDurationLabel, 100);
        } else {
            audioPlayer.pause();
            clearInterval(timer);
        }
    };


    playButton.addEventListener("click", playMusic, false);

    stopButton.addEventListener("click", stopAudio, false);

    backButton.addEventListener("click", stopAudio, false);


    audioPlayer.addEventListener("loadeddata", () => {
        dataAvailable = true;
        currentLength = audioPlayer.duration;
    });


    // Converts time in ms to zero-padded string in seconds
    function parseTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time - minutes * 60);
        const secondsZero = seconds < 10 ? "0" : "";
        const minutesZero = minutes < 10 ? "0" : "";
        return minutesZero + minutes.toString() + ":" + secondsZero + seconds.toString();
    }

    //  Stops the audio from playing
    function stopAudio() {
        playerArea.classList.remove("play");
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        updateDurationLabel();
    }

    // Updates the duration label
    function updateDurationLabel() {
        if (dataAvailable) {
        durationLabel.innerText = parseTime(audioPlayer.currentTime) + " / " + parseTime(currentLength);
        } else {
        durationLabel.innerText = parseTime(audioPlayer.currentTime);
        }
    }

    // stop on completion
    audioPlayer.addEventListener("ended", () => {
        stopAudio();
    });


    speak_div.addEventListener("click", playMusic, false);
    // Media player
}


// Search select element

/* START select3.js */
/*
Creditor: Deky
Last Date Modified: 25 April 2016
Purpose: Transform SELECT TAG HTML to SEARCH TEXTBOX + LISTBOX
Required: JQUERY
Required: FOUNDATION
Required: FONT AWESOME ICON
Inspiration: https://select2.github.io/
*/
/*
Creditor: Deky
Last Date Modified: 25 April 2016
Purpose: Transform SELECT TAG HTML to SEARCH TEXTBOX + LISTBOX
Required: JQUERY
Required: FOUNDATION
*/
(function($) {
    $.fn.select3 = function(options) {
        var dataItems = [];
        var selectorID = '#' + this.attr('id');

        $(selectorID).find('option').each(function(index, element) {
            var optionValue = element.value.trim();
            var optionText = element.text.trim();
            dataItems.push({
                value: optionValue,
                text: optionText
            });
        });

        var opts = $.extend({}, $.fn.select3.defaults, options);

        var idDiv = this.attr('id') + 'searchSelect3';
        var idInput = this.attr('id') + 'searchSelect3_Input';
        var idClose = this.attr('id') + 'searchSelect3_Times';
        var idDown = this.attr('id') + 'searchSelect3_Caret_Down';
        var idList = this.attr('id') + 'searchSelect3_List';
        var idListLi = this.attr('id') + 'searchSelect3_List_LI';

        var selectorDiv = '#' + this.attr('id') + 'searchSelect3';
        var selectorInput = '#' + this.attr('id') + 'searchSelect3_Input';
        var selectorClose = '#' + this.attr('id') + 'searchSelect3_Times';
        var selectorDown = '#' + this.attr('id') + 'searchSelect3_Caret_Down';
        var selectorList = '#' + this.attr('id') + 'searchSelect3_List';
        var selectorListLi = '#' + this.attr('id') + 'searchSelect3_List_LI';

        $(selectorInput).val(opts.defaultText);
        $(selectorID).val(opts.defaultValue);

        var buildELement = $('<div class="searchSelect3" id="' + idDiv + '" style="position:relative;"><input class="searchSelect3_Input" placeholder="' + opts.placeholder + '" value="' + opts.defaultText + '" id="' + idInput + '"><span class="material-symbols-outlined searchSelect3_Times" id="' + idClose + '">delete</span><span class="material-symbols-outlined searchSelect3_Caret_Down" id="' + idDown + '">arrow_drop_down</span></div>');

        if ($(selectorDiv).length > 0) {
            $(selectorDiv).remove();
        }

        this.after(buildELement);

        if (opts.width > 0) {
            $(selectorInput).css('width', opts.width);
            $(selectorDown).css('left', (opts.width - 20));
            $(selectorClose).css('left', (opts.width - 40));
        }


        var cache = {};
        var drew = false;
        this.hide();



        $(document).on('click', function(e) {
            //untuk menghilangkan list saat unfocus
            if ($(e.target).parent().is("li[id*='" + idListLi + "']") == false) {
                if ($(e.target).attr('id') != idInput && $(e.target).attr('id') != idDown) {
                    $(selectorList).empty();
                    $(selectorList).css('z-index', -1);
                    $(selectorClose).hide();
                }
            }
        });


        var showList = function(query, valuee) {

            //Check if we've searched for this term before
            if (query in cache) {
                results = cache[query];
            } else {
                // Case-insensitive search for our dataItems array
                var results = $.grep(dataItems, function(item) {
                    return item.text.search(new RegExp(query, "i")) != -1;
                });

                //Add results to cache
                cache[query] = results;
            }

            //First search
            $(selectorList).css('z-index', opts.zIndex);


            if (drew == false) {
                //Create list for results
                $(selectorInput).after('<ul id="' + idList + '" class="searchSelect3_List" style="z-index:' + opts.zIndex + '"></ul>');

                if (opts.width > 0) {

                    $(selectorList).css('width', opts.width);

                }

                if (opts.widthList > 0) {
                    $(selectorList).css('width', opts.widthList);
                }

                //Prevent redrawing/binding of list
                drew = true;

                //Bind click event to list elements in results
                $(selectorList).on("click", "li", function() {
                    var nilai = $(this).text();
                    var selectedValue = $(this).data('value');

                    $(selectorInput).val(nilai);
                    $(selectorID).val(selectedValue); // Update the value of the original select element
                    $(selectorList).empty();
                    $(selectorClose).show();
                    $(selectorList).css('z-index', -1);
                    $(selectorID).change();
                });


            }
            //Clear old results
            else {
                $(selectorList).empty();
            }

            var counter = 0;
            //Add results to the list
            for (term in results) {
                counter++;
                var optionValue = results[term].value;
                var optionText = results[term].text;
                $(selectorList).append('<li id="' + idListLi + counter + '" data-value="' + optionValue + '"><label>' + optionText + '</label></li>');
            }
        };


        $(selectorInput).on('click', function(e) {
            var query = $(this).val();

            showList('', query);


            $(selectorClose).hide();
            if (query.length > 0) {
                $(selectorClose).show();
            }

        });

        $(selectorInput).on('keyup', function(e) {
            $(selectorList).empty();
            var query = $(selectorInput).val();
            showList(query, query);

            $(selectorClose).hide();
            if (query.length > 0) {
                $(selectorClose).show();
            }

            $(selectorID).change();
        });

        //bila key tab di tekan maka akan pindah ke DOM lain, maka dari itu mesti di HIDE LIST nya
        $(selectorInput).on('keydown', function(e) {
            if (e.which == 9) {
                $(selectorList).empty();
                $(selectorList).css('z-index', -1);
                $(selectorClose).hide();
            }
        });

        $(selectorDown).on('click', function(e) {
            var query = $(this).val();
            if ($(selectorList).find('li').length == 0) {
                showList('', query);
            } else {
                //$(selectorList).css('z-index', -1);
                $(selectorList).empty();
                $(selectorList).css('z-index', -1);
            }

            $(selectorClose).hide();
            if (query.length > 0) {
                $(selectorClose).show();
            }

        });

        $(selectorClose).on('click', function(e) {
            $(selectorInput).val('');
            $(selectorClose).hide();
            $(selectorID).change();

        });


        return this;
    };

    $.fn.select3.defaults = {
        placeholder: "",
        zIndex: 1,
        defaultText: "",
        width: 0,
        widthList: 0,
        defaultValue: "",
    };

}(jQuery));
/* END select3.js */


$(document).ready(function(e) {
    $('#selectVoiceAccentList').select3({
        width: 300,
        placeholder: 'Type to search accents',
        zIndex: 100,
        widthList: 300,
        defaultValue: "com",
        defaultText: "Local/Default",
    });
    $('#selectLangList').select3({
        width: 300,
        placeholder: 'Type to search languages',
        zIndex: 100,
        widthList: 300,
        defaultValue: "en",
        defaultText: "English",
    });
});


// Search select element