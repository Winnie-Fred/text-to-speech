// Media player


const speak = document.querySelector(".speak div");
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