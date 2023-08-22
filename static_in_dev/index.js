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

let MAX_UPLOAD_SIZE_IN_BYTES = 10 * 1000 * 1000;
let MAX_UPLOAD_SIZE_FORMATTED = fileSizeFormat(MAX_UPLOAD_SIZE_IN_BYTES);

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
        uploadButton.disabled = false;
    }
}

document.addEventListener("click", function(e) {
    const target = e.target.closest(".default-file-input");

    if (target) {
        target.value = '';
        fileInput = target;
        uploadedFile.style.cssText = "display: none;";
        uploadIcon.innerHTML = 'file_upload';
        dragDropText.innerHTML = 'Drag & drop any file here';
        uploadButton.innerHTML = `Upload`;
        uploadButton.disabled = false;
    }
});

document.body.addEventListener('change', function(event) {
    if (event.target.className === 'default-file-input') {
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
            document.querySelector('.select-file-text').textContent = "Please keep file size under " + MAX_UPLOAD_SIZE_FORMATTED + ". Current file size: " + fileSizeFormat(fileInput.files[0].size);
            showNotification(CORRECT_FORM_ERROR_MESSAGE);
            fileInput.value = '';
            return
        }

        uploadIcon.innerHTML = 'check_circle';
        dragDropText.innerHTML = 'File Selected Successfully!';
        document.querySelector(".label").innerHTML = `Drag & drop or <span class="browse-files"><input type="file" class="default-file-input" accept=".txt,.docx,.pdf" name="file_to_convert" style=""/><span class="browse-files-text">browse file</span></span>`;
        uploadButton.innerHTML = `Upload`;
        uploadButton.disabled = false;
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

    if (!adjacentElement) {
        adjacentElement = errorSpan.previousElementSibling;
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
    
    const className = type === 'error' ? 'error-span' : type === 'info' ? 'info-span' : 'success-span';
    
    const spanElem = document.createElement('span');
    spanElem.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
    spanElem.className = className;
    
    const icon = type === 'error' ? 'error' : type === 'info' ? 'info' : 'check_circle';
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
        const fileInputField = document.querySelector(".default-file-input");
        resetFileUploadForm(fileInputField);
    } else {
        mainContent.style.display = 'none';
        dynamicContent.style.display = 'flex';
    }
    toggleBackButton();
}

function uploadToServer(elementName, objectToUpload, csrftoken, url, lang, accent, trackProgress) {
    let formData = new FormData();
    formData.append(elementName, objectToUpload);
    formData.append('select_lang', lang);
    formData.append('select_voice_accent', accent);
    const uploadToServerRequest = $.ajax({
        url: url,
        type: 'POST',
        data: formData,
        dataType: 'json',
        processData: false,
        contentType: false,
        cache: false,
        enctype: 'multipart/form-data',
        beforeSend: function(xhr) {
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); //  Necessary to work with django's request.headers.get('x-requested-with') == 'XMLHttpRequest'
        xhr.setRequestHeader('X-CSRFToken', csrftoken);
        },
        xhr: function () {
            const xhr = new window.XMLHttpRequest();
            if (trackProgress) {
                xhr.upload.addEventListener('progress', e => {
                    if (e.lengthComputable) {
                        const uploadProgress = (e.loaded/e.total) * 100;
                        progressBar.style.width = `${uploadProgress}%`;
                        if (e.loaded === e.total) {
                            uploadButton.innerHTML = `<span class="material-icons-outlined upload-button-icon"> check_circle </span> Uploaded`;
                        }

                    }
                });
                uploadButton.disabled = true;
            }
            return xhr;
        },
        success: function(data) {
        if (!data.context.errors) {
            // Perform actions with the response data from the view
            $('.dynamic-content-wrapper').html(data.html);
            toggleContent();
            const abortTaskUrl = data.context.abort_task_url;
            $('.abort-button').on('click', function() {
                abortTask(abortTaskUrl);
            });
            $('.return-div').addClass('abort-task').attr('data-abort-task-url', abortTaskUrl);
            if (data.context.extra_info) {
                showNotification(data.context.extra_info, 'info');
            }
            checkTaskProgress(data.context.get_progress_url);
        } else {
            showNotification(CORRECT_FORM_ERROR_MESSAGE);
    
            // Append errors to form fields
            const formErrors = data.context.form_errors;
            const formFields = ['voice_accent_form', 'choose_lang_form'];
    
            if ('file_upload_form_errors' in data.context.form_errors) {
                formFields.push('file_upload_form');
            } else if ('text_input_form_errors' in data.context.form_errors) {
                formFields.push('text_input_form');
            }
    
            formFields.forEach(function(fieldName) {
                appendErrorSpan(fieldName, formErrors);
            });
        }
        },
        error: function(xhr, status, error) {
            if (status === 'abort') {
                return
            }
            console.log('response status: ', status);
            console.log('response status text: ', error);
        
            const error_msg = [
                "An error occurred while trying to communicate with the server.",
                "Sorry about that. Please try again."
            ];
        
            toggleContent();
            displayError(error_msg);
        }
    });
    removeFileButton.addEventListener("click", () => {
        uploadToServerRequest.abort();
    });
  
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
                        const audioData = data.context.audio_data;
                        initializeAudioPlayer(audioData);
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
        toggleContent();
        showNotification(data.message, 'success');
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
        var returnDivWrapper = document.getElementById("return-div-wrapper")
        var spanElem = document.createElement("span");
        spanElem.className = "return-div";
        spanElem.innerHTML = `<div class="button-group"><div id="return-button"><div class="arrow-wrap"><span class="arrow-part-1"></span><span class="arrow-part-2"></span><span class="arrow-part-3"></span></div></div><div class="back-button-text">Go Back</div></div>`;
        returnDivWrapper.appendChild(spanElem);

        function backAnim() {
            const returnButton = document.getElementById("return-button");
            if (returnButton.classList.contains('back')) {
                returnButton.classList.remove('back');
                returnButton.addEventListener('transitionend', onAnimationEnd, { once: true });
            } else {
                returnButton.classList.add('back');
                setTimeout(backAnim, 1000);
            }
        }
        
        function onAnimationEnd() {
            // This function will be executed when the animation is complete
        
            if (spanElem.classList.contains('abort-task')) {
                const abortTaskUrl = spanElem.getAttribute('data-abort-task-url');
                abortTask(abortTaskUrl);
            } else {
                toggleContent();
            }
        
            // Remove the event listener to avoid multiple executions
            spanElem.removeEventListener('transitionend', onAnimationEnd);
        }
        
        spanElem.addEventListener("click", () => {
            backAnim();
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
            
            const lang = document.querySelector("#selectLangList").value;
            const accent = document.querySelector("#selectVoiceAccentList").value;

            uploadToServer('file_to_convert', fileInput.files[0], csrftoken, '/convert_file_content', lang, accent, true)
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

        uploadToServer('text_to_convert', textToConvert, csrftoken, '/convert_input_text', lang, accent, false)
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
            document.querySelector('.select-file-text').textContent = "Please keep file size under " + MAX_UPLOAD_SIZE_FORMATTED + ". Current file size: " + fileSizeFormat(files[0].size);
            showNotification(CORRECT_FORM_ERROR_MESSAGE);
            fileInput.value = '';
            return
        }

        uploadIcon.innerHTML = 'check_circle';
        dragDropText.innerHTML = 'File Dropped Successfully!';
        document.querySelector(".label").innerHTML = `Drag & drop or <span class="browse-files"><input name="file_to_convert" accept=".txt,.docx,.pdf" type="file" class="default-file-input" style=""/><span class="browse-files-text" style="top: -23px;">browse file</span></span>`;
        uploadButton.innerHTML = `Upload`;
        uploadButton.disabled = false;

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


function initializeAudioPlayer(audioData) {
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
    const seekBar = document.getElementById("seekBar");
    let dataAvailable = false;
    let currentLength;
    let timer;

    const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    audioPlayer.src = audioUrl;

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
        
        audioPlayer.addEventListener('timeupdate', () => {
            const currentTime = audioPlayer.currentTime;
            const progressWidth = (currentTime / currentLength) * 100;
            seekBar.value = progressWidth;
        });
        
        seekBar.addEventListener('input', (e) => {
            const seekPercentage = parseInt(e.target.value);
            const newTime = (seekPercentage / 100) * currentLength;
            audioPlayer.currentTime = newTime;
        });
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