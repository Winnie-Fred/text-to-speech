/* Drag and drop files */
var isAdvancedUpload = function() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

const CORRECT_FORM_ERROR_MESSAGE = "Please correct the errors in the form";
const errorIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#bb0000"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
const successIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/></svg>'
const infoIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>'
const cancelIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#bb0000"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z"/></svg>'
const uploadDropIconText = '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="50px" viewBox="0 0 24 24" width="50px" fill="#FFFFFF"><g><rect fill="none" height="50" width="50"/></g><g><path d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M7,9l1.41,1.41L11,7.83V16h2V7.83l2.59,2.58L17,9l-5-5L7,9z"/></g></svg>'
const DropSuccessIconText = '<svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 0 24 24" width="50px" fill="#fff"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/></svg>'

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
let textToConvertBtn = document.querySelector('.convert-entered-text-btn');
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

let allowed_mime_types = {
    "text/plain":"TXT",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":"DOCX",
    "application/pdf":"PDF",
}

function fileTypeIsAllowed(file, callback) {
    let txtMime = "text/plain"
    if (file.type === txtMime) {
        callback(allowed_mime_types.hasOwnProperty(txtMime));
        return;
    }

    const mimes = [
        {
            mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            pattern: [0x50, 0x4B, 0x03, 0x04],
            mask: [0xFF, 0xFF, 0xFF, 0xFF],
        },
        {
            mime: 'application/pdf',
            pattern: [0x25, 0x50, 0x44, 0x46],
            mask: [0xFF, 0xFF, 0xFF, 0xFF],
        }
    ];

    function check(bytes, mime) {
        for (var i = 0, l = mime.mask.length; i < l; ++i) {
            if ((bytes[i] & mime.mask[i]) - mime.pattern[i] !== 0) {
                return false;
            }
        }
        return true;
    }

    const blob = file.slice(0, 4); // read the first 4 bytes of the file

    const reader = new FileReader();

    reader.onloadend = function(e) {
        if (e.target.readyState === FileReader.DONE) {
            const bytes = new Uint8Array(e.target.result);

            for (var i = 0, l = mimes.length; i < l; ++i) {
                if (check(bytes, mimes[i])) {
                    callback(allowed_mime_types.hasOwnProperty(mimes[i].mime));
                    return;
                }
            }

            callback(false);
        }
    };
    reader.readAsArrayBuffer(blob);
}


function resetFileUploadForm(fileInputField) {
    if (fileInputField) {
        fileInputField.value = '';
        fileInput = fileInputField;
        uploadedFile.style.cssText = "display: none;";
        uploadIcon.innerHTML = uploadDropIconText;
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
        uploadIcon.innerHTML = uploadDropIconText;
        dragDropText.innerHTML = 'Drag & drop any file here';
        uploadButton.innerHTML = `Upload`;
        uploadButton.disabled = false;
    }
});

function handleFileSelection(file, nameOfFile, successActionText) {
    fileTypeIsAllowed(file, function(isAllowed) {
      if (!isAllowed) {
        fileFlag = 1;
        fileInput.value = '';
        cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
        document.querySelector('.select-file-text').textContent = "Please upload only .txt, .docx or .pdf files";
        showNotification(CORRECT_FORM_ERROR_MESSAGE);
      } else if (file.size > MAX_UPLOAD_SIZE_IN_BYTES) {
        fileFlag = 1;
        cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
        document.querySelector('.select-file-text').textContent = "Please keep file size under " + MAX_UPLOAD_SIZE_FORMATTED + ". Current file size: " + fileSizeFormat(file.size);
        showNotification(CORRECT_FORM_ERROR_MESSAGE);
        fileInput.value = '';
      } else {
        uploadIcon.innerHTML = DropSuccessIconText;
        dragDropText.innerHTML = `File ${successActionText} Successfully!`;
        document.querySelector(".label").innerHTML = `Drag & drop or <span class="browse-files"><input type="file" class="default-file-input" accept=".txt,.docx,.pdf" name="file_to_convert" style=""/><span class="browse-files-text">browse file</span></span>`;
        uploadButton.innerHTML = `Upload`;
        uploadButton.disabled = false;
        fileName.innerHTML = nameOfFile;
        fileSize.innerHTML = fileSizeFormat(file.size);
        uploadedFile.style.cssText = "display: flex;";
        progressBar.style.width = 0;
        fileFlag = 0;
      }
    });
}

document.body.addEventListener('change', function(event) {
    if (event.target.className === 'default-file-input') {
        fileInput = event.target;
        const nameOfFile = fileInput.files[0].name

        handleFileSelection(fileInput.files[0], nameOfFile, 'Selected');
    };
});

document.addEventListener('click', function(event) {
    if (event.target.closest(".cancel-alert-button-remove")) {
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
            <span class="material-icons-outlined">${errorIcon}</span>
            <p>${error}</p>
        </span>
        <span class="material-icons-outlined cancel-alert-button-remove">${cancelIcon}</span>`;
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
    const errorSpan = removeButton.closest('.error-span');

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

function removeExistingNotification() {
    const notification = document.getElementById("notification");

    const existingNotificationDiv = document.getElementById("notification-div");
    if (existingNotificationDiv) {
        notification.removeChild(existingNotificationDiv);
    }
}

function showNotification(message, type='error') {
    removeExistingNotification();
    const notification = document.getElementById("notification");
    
    const newNotificationDiv = document.createElement("div");
    newNotificationDiv.id = "notification-div";
    
    const className = type === 'error' ? 'error-span' : type === 'info' ? 'info-span' : 'success-span';
    
    const spanElem = document.createElement('span');
    spanElem.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
    spanElem.className = className;
    
    const icon = type === 'error' ? errorIcon : type === 'info' ? infoIcon : successIcon;
    const iconColor = type === 'error' ? "#bb0000" : type === 'info' ? '#276efa' : "#45bb00";
    const spanContent = `<span class="error-span-main-wrap">
    <span class="material-icons-outlined">${icon}</span>
    <p>${message}</p>
    </span>
    <span class="material-icons-outlined cancel-alert-button-remove"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="${iconColor}"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z"/></svg></span>`;
    spanElem.innerHTML = spanContent;
    newNotificationDiv.appendChild(spanElem);
    notification.appendChild(newNotificationDiv);
    const svgSelector = document.querySelector('#notification-div svg'); // Get first svg
    svgSelector.style.fill = iconColor;
}


function toggleContent() {
    const mainContent = document.querySelector('.main-content-wrapper');
    const dynamicContent = document.querySelector('.dynamic-content-wrapper');
    const configWrapper = document.querySelector('.config-wrapper');

    if (mainContent.style.display === 'none') {
        dynamicContent.innerHTML = '';
        dynamicContent.style.display = 'none';
        mainContent.style.display = 'flex';
        configWrapper.style.display = 'flex';
        const fileInputField = document.querySelector(".default-file-input");
        resetFileUploadForm(fileInputField);
        removeExistingNotification();
    } else {
        mainContent.style.display = 'none';
        configWrapper.style.display = 'none';
        dynamicContent.style.display = 'flex';
    }
    toggleBackButton();
}

function uploadToServer(elementName, objectToUpload, csrftoken, url, lang, accent) {
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
            progressBar.style.display = 'flex';
            xhr.upload.addEventListener('progress', e => {
                if (e.lengthComputable) {
                    const uploadProgress = (e.loaded/e.total) * 100;
                    progressBar.style.width = `${uploadProgress}%`;
                    if (elementName === 'file_to_convert' && e.loaded === e.total) {
                        uploadButton.innerHTML = `<span class="material-icons-outlined upload-button-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#fff"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/></svg></span> Uploaded`;
                    }
                }
            });
            if (elementName === 'file_to_convert') {
                uploadButton.disabled = true;
            }
            return xhr;
        },
        success: function(data) {
            progressBar.style.display = 'none';

            if (!data.context.errors) {
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
            progressBar.style.display = 'none';

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
    const pageHeading = document.querySelector('.pageHeading');
    if (backButton) {
        pageHeading.style.display = 'none';
        backButton.remove();
    } else {
        pageHeading.style.display = 'flex';
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
                setTimeout(backAnim, 300);
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

            uploadToServer('file_to_convert', fileInput.files[0], csrftoken, '/convert_file_content', lang, accent)
        }
    } else {
        document.querySelector('.select-file-text').textContent = " Please select a file first ";
        cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
        showNotification(CORRECT_FORM_ERROR_MESSAGE);
    }
});

textToConvertBtn.addEventListener("click", function (e) {
    
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
        handleFileSelection(files[0], nameOfFile, 'Dropped');
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
        
        var buildELement = $('<div class="searchSelect3" id="' + idDiv + '" style="position:relative;"><input class="searchSelect3_Input" placeholder="' + opts.placeholder + '" value="' + opts.defaultText + '" id="' + idInput + '"><span class="material-symbols-outlined searchSelect3_Times" id="' + idClose + '"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#302f2f"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></span><span class="material-symbols-outlined searchSelect3_Caret_Down" id="' + idDown + '">arrow_drop_down</span></div>');
        
        
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