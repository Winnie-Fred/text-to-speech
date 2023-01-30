/* Drag and drop files */
var isAdvancedUpload = function() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
  }();
  
let draggableFileArea = document.querySelector(".drag-file-area");
let browseFileText = document.querySelector(".browse-files");
let uploadIcon = document.querySelector(".upload-icon");
let dragDropText = document.querySelector(".dynamic-message");
var fileInput = document.querySelector(".default-file-input");
let cannotUploadMessage = document.querySelector(".cannot-upload-message");
let cannotLeaveFieldBlank = document.querySelector(".cannot-leave-blank-message");
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

let MAX_UPLOAD_SIZE_IN_MB = 50
let ONE_MB_IN_BYTES = 1024 * 1024
let MAX_UPLOAD_SIZE_IN_BYTES = MAX_UPLOAD_SIZE_IN_MB * ONE_MB_IN_BYTES
let MAX_UPLOAD_SIZE_KB = (MAX_UPLOAD_SIZE_IN_MB).toFixed(1) + " MB"

document.addEventListener("click", function(e){
    const target = e.target.closest(".default-file-input");

    if(target){
        target.value = '';
        fileInput = target;
        uploadedFile.style.cssText = "display: none;";
        uploadIcon.innerHTML = 'file_upload';
        dragDropText.innerHTML = 'Drag & drop any file here';
        uploadButton.innerHTML = `Upload`;
    }
  });

document.body.addEventListener( 'change', function ( event ) {
    if( event.target.className == 'default-file-input' ) {
        fileInput = event.target;
        const nameOfFile = fileInput.files[0].name
        const nameOfFileLowercased = nameOfFile.toLowerCase();
        if (!(nameOfFileLowercased.endsWith('.txt') || nameOfFileLowercased.endsWith('.doc') || nameOfFileLowercased.endsWith('.docx') || nameOfFileLowercased.endsWith('.pdf'))) {
            fileFlag = 1;
            fileInput.value = '';
            cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
            document.querySelector('.select-file-text').textContent = "Please upload only .txt, .doc, .docx or .pdf files";
            return
        } 

        if (fileInput.files[0].size > MAX_UPLOAD_SIZE_IN_BYTES) {
            fileFlag = 1;
            cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
            document.querySelector('.select-file-text').textContent = "Please keep file size under " + MAX_UPLOAD_SIZE_KB + ". Current filesize: " + (fileInput.files[0].size/(1024*1024)).toFixed(1) + " MB";            
            fileInput.value = '';
            return
        }

        uploadIcon.innerHTML = 'check_circle';
        dragDropText.innerHTML = 'File Dropped Successfully!';
        document.querySelector(".label").innerHTML = `drag & drop or <span class="browse-files"><input type="file" class="default-file-input" accept=".txt,.doc,.docx,.pdf" name="file_to_convert" style=""/><span class="browse-files-text" style="top: 0;"> browse file</span></span>`;
        uploadButton.innerHTML = `Upload`;
        fileName.innerHTML = nameOfFile;
        fileSize.innerHTML = (fileInput.files[0].size/(1024*1024)).toFixed(1) + " MB";
        uploadedFile.style.cssText = "display: flex;";
        progressBar.style.width = 0;
        fileFlag = 0;
        
    };
    } );


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

async function uploadToServer(elementName, objectToUpload, csrftoken, url) {
    let formData = new FormData(); 
    formData.append(elementName, objectToUpload);
    await fetch(url, {
        body: formData,
        method: 'POST',
        credentials: 'same-origin',
        headers:{
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
    if ((data.context.errors).length === 0) {
        document.querySelector(".entire-content-wrapper").innerHTML = data.html
        var new_script = document.createElement('script');
        new_script.setAttribute('src','/static/conversion_successful.js');
        document.head.appendChild(new_script);
    } else {
        displayError(data.context.errors);
    }
    })
    .catch((response) => {
        console.log("response status: ", response.status);
        console.log("response status text: ", response.statusText)

        const error_msg = ["An error occured while trying to communicate with the server.",
                            "Sorry about that. Please try again."
                            ];

        displayError(error_msg);

      });
    ; 
}

function startPreloader () {
    document.querySelector(".entire-content-wrapper").innerHTML = `<div class="div-wrapper-for-loaded-content"><div id="loader">
    <main>
        <svg class="ip" viewBox="0 0 256 128" width="256px" height="50px" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#5ebd3e" />
                    <stop offset="33%" stop-color="#ffb900" />
                    <stop offset="67%" stop-color="#f78200" />
                    <stop offset="100%" stop-color="#e23838" />
                </linearGradient>
                <linearGradient id="grad2" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#e23838" />
                    <stop offset="33%" stop-color="#973999" />
                    <stop offset="67%" stop-color="#009cdf" />
                    <stop offset="100%" stop-color="#5ebd3e" />
                </linearGradient>
            </defs>
            <g fill="none" stroke-linecap="round" stroke-width="16">
                <g class="ip__track" stroke="#ddd">
                    <path d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56"/>
                    <path d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64"/>
                </g>
                <g stroke-dasharray="180 656">
                    <path class="ip__worm1" stroke="url(#grad1)" stroke-dashoffset="0" d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56"/>
                    <path class="ip__worm2" stroke="url(#grad2)" stroke-dashoffset="358" d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64"/>
                </g>
            </g>
        </svg>
        <div class="loading-text">Processing...</div>
        <div class="extra-loading-text">Please hold on...This may take a while</div>
    </main>
</div></div>`
}

function replacePreloaderWithErrorAnimation () {
    document.querySelector(".entire-content-wrapper").innerHTML = `<!-- Simple error animation, credits to https://codepen.io/bmartin97/pen/yLYOKVM 
    -->
    <div class="div-wrapper-for-loaded-content">
      <div class="error-container">
          <div class="circle-border"></div>
          <div class="circle">
              <div class="error"></div>
            </div>
          </div>
      </div>
    </div>
    `
}

function addBackButton () {
    var header = document.querySelector("header")
    var spanELem = document.createElement("span");
    spanELem.className = "return-div";
    spanELem.innerHTML = `<a id="return-button" href="/" title="Back" class="close"><svg id="return-arrow" class="fa-solid fa-arrow-left-long" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M109.3 288L480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288z"/></svg><span>Return</span></a>`;
    header.parentNode.insertBefore(spanELem, header.nextSibling);
}

function displayError (errorList) {

    replacePreloaderWithErrorAnimation();
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
    let isFileUploaded = fileInput.value;
    if(isFileUploaded != '') {
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

            startPreloader();
            addBackButton();
            
            // Make async ajax request
            uploadToServer('file_to_convert', fileInput.files[0], csrftoken, '/convert_file_content')
          }
    } else {
        document.querySelector('.select-file-text').textContent = " Please select a file first ";
        cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
    }
});


textConvertButton.addEventListener("click", () => {
    let textToConvert = document.querySelector(".text").value.trim();

    if (textToConvert.length !== 0) {
        startPreloader();
        addBackButton();
    
        // Make ajax request
        uploadToServer('text_to_convert', textToConvert, csrftoken, '/convert_input_text')
    } else {
        cannotLeaveFieldBlank.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
    }

});


cancelAlertButtonForFileInput.addEventListener("click", () => {
    cannotUploadMessage.style.cssText = "display: none;";
});

cancelAlertButtonForTextInput.addEventListener("click", () => {
    cannotLeaveFieldBlank.style.cssText = "display: none;";
});

if(isAdvancedUpload) {
    ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach( evt => 
        draggableFileArea.addEventListener(evt, e => {
            e.preventDefault();
            e.stopPropagation();
        })
    );

    ["dragover", "dragenter"].forEach( evt => {
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

        if (!(nameOfFileLowercased.endsWith('.txt') || nameOfFileLowercased.endsWith('.doc') || nameOfFileLowercased.endsWith('.docx') || nameOfFileLowercased.endsWith('.pdf'))) {
            fileFlag = 1;
            fileInput.value = '';
            cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
            document.querySelector('.select-file-text').textContent = "Please upload only .txt, .doc, .docx or .pdf files";
            return
        } 

        if (files[0].size > MAX_UPLOAD_SIZE_IN_BYTES) {
            fileFlag = 1;
            cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
            document.querySelector('.select-file-text').textContent = "Please keep file size under " + MAX_UPLOAD_SIZE_KB + ". Current filesize: " + (files[0].size/(1024*1024)).toFixed(1) + " MB";            
            fileInput.value = '';
            return
        }

        uploadIcon.innerHTML = 'check_circle';
        dragDropText.innerHTML = 'File Dropped Successfully!';
        document.querySelector(".label").innerHTML = `drag & drop or <span class="browse-files"><input name="file_to_convert" accept=".txt,.doc,.docx,.pdf" type="file" class="default-file-input" style=""/><span class="browse-files-text" style="top: -23px; left: -20px;"> browse file </span></span>`;
        uploadButton.innerHTML = `Upload`;
        
        fileName.innerHTML = nameOfFile;
        fileSize.innerHTML = (files[0].size/(1024*1024)).toFixed(1) + " MB";
        uploadedFile.style.cssText = "display: flex;";
        progressBar.style.width = 0;
        fileFlag = 0;
       

    });
}

removeFileButton.addEventListener("click", () => {
    uploadedFile.style.cssText = "display: none;";
    fileInput.value = '';
    uploadIcon.innerHTML = 'file_upload';
    dragDropText.innerHTML = 'Drag & drop any file here';
    document.querySelector(".label").innerHTML = `or <span class="browse-files"><input name="file_to_convert" accept=".txt,.doc,.docx,.pdf" type="file" class="default-file-input"/><span class="browse-files-text"> browse file </span><span>from device</span></span>`;
    uploadButton.innerHTML = `Upload`;
});

/* Drag and drop files */

function query(a){
  return document.querySelector(a);
}

function queryAll(a){
  return document.querySelectorAll(a);
}


let clear = query(".clear");
let text = query(".text");
let speeedDiv = query(".speed");
let speeedDivControl = query(".speed img");
let synth = window.speechSynthesis;
let playing = query(".playing");
let div_speak = query(".speak div");
let stopSpeech = query(".stop");
let pause = query(".pause")
let working = queryAll(".working");
let utter;


clear.onclick = function(){
  text.value = "";
  localStorage.setItem("value","");
}


div_speak.onmousedown = scaleDown;


function scaleDown(){
  let _this = this;
  this.style.transform = "scale(40%)"

  setTimeout(function(){
    _this.style.transform = "scale(100%)"
  },100)
}
  