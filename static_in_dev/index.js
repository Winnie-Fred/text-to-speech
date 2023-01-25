/* Drag and drop files */
var isAdvancedUpload = function() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
  }();
  
let draggableFileArea = document.querySelector(".drag-file-area");
let browseFileText = document.querySelector(".browse-files");
let uploadIcon = document.querySelector(".upload-icon");
let dragDropText = document.querySelector(".dynamic-message");
let fileInput = document.querySelector(".default-file-input");
let cannotUploadMessage = document.querySelector(".cannot-upload-message");
let cancelAlertButton = document.querySelector(".cancel-alert-button");
let uploadedFile = document.querySelector(".file-block");
let fileName = document.querySelector(".file-name");
let fileSize = document.querySelector(".file-size");
let progressBar = document.querySelector(".progress-bar");
let removeFileButton = document.querySelector(".remove-file-icon");
let uploadButton = document.querySelector(".upload-button");
let fileFlag = 0;

fileInput.addEventListener("click", () => {
    fileInput.value = '';
    console.log(fileInput.value);
});

fileInput.addEventListener("change", e => {
    console.log(" > " + fileInput.value)
    uploadIcon.innerHTML = 'check_circle';
    dragDropText.innerHTML = 'File Dropped Successfully!';
    document.querySelector(".label").innerHTML = `drag & drop or <span class="browse-files"> <input type="file" class="default-file-input" style=""/> <span class="browse-files-text" style="top: 0;"> browse file</span></span>`;
    uploadButton.innerHTML = `Upload`;
    fileName.innerHTML = fileInput.files[0].name;
    fileSize.innerHTML = (fileInput.files[0].size/1024).toFixed(1) + " KB";
    uploadedFile.style.cssText = "display: flex;";
    progressBar.style.width = 0;
    fileFlag = 0;
});

uploadButton.addEventListener("click", () => {
    let isFileUploaded = fileInput.value;
    if(isFileUploaded != '') {
        if (fileFlag == 0) {
            fileFlag = 1;
            var width = 0;
            var id = setInterval(frame, 50);
            function frame() {
                  if (width >= 390) {
                    clearInterval(id);
                    uploadButton.innerHTML = `<span class="material-icons-outlined upload-button-icon"> check_circle </span> Uploaded`;
                  } else {
                    width += 5;
                    progressBar.style.width = width + "px";
                  }
            }
          }
    } else {
        cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
    }
});

cancelAlertButton.addEventListener("click", () => {
    cannotUploadMessage.style.cssText = "display: none;";
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
        uploadIcon.innerHTML = 'check_circle';
        dragDropText.innerHTML = 'File Dropped Successfully!';
        document.querySelector(".label").innerHTML = `drag & drop or <span class="browse-files"> <input type="file" class="default-file-input" style=""/> <span class="browse-files-text" style="top: -23px; left: -20px;"> browse file</span> </span>`;
        uploadButton.innerHTML = `Upload`;
        
        let files = e.dataTransfer.files;
        fileInput.files = files;
        console.log(files[0].name + " " + files[0].size);
        console.log(document.querySelector(".default-file-input").value);
        fileName.innerHTML = files[0].name;
        fileSize.innerHTML = (files[0].size/1024).toFixed(1) + " KB";
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
    document.querySelector(".label").innerHTML = `or <span class="browse-files"> <input type="file" class="default-file-input"/> <span class="browse-files-text">browse file</span> <span>from device</span> </span>`;
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
let speak = query(".speak div");
let stopSpeech = query(".stop");
let pause = query(".pause")
let working = queryAll(".working");
console.log(working)
let utter;


clear.onclick = function(){
  text.value = "";
  localStorage.setItem("value","");
}


speak.onmousedown = scaleDown;


function scaleDown(){
  let _this = this;
  this.style.transform = "scale(40%)"

  setTimeout(function(){
    _this.style.transform = "scale(100%)"
  },100)
}




// Media player
     
const backButton = document.getElementById("back-button");
const playerArea = document.getElementById("mediaPlayer");
const playButton = document.getElementById("playState");
const stopButton = document.getElementById("stopItem");
const nextButton = document.getElementById("nextItem");
const prevButton = document.getElementById("backItem");
const durationLabel = document.getElementById("currentDuration");
const audioTitleLabel = document.getElementById("audioTitleLabel");
const audioPlayer = document.getElementById("audioPlayer");
audioPlayer.volume = 0.05;
const volumeSlider = document.getElementById("volumeSlider");
let currentIndex = 0;
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
    console.log("SOng has ended")
    stopAudio();
});


speak.addEventListener("click", playMusic, false);
// Media player
  