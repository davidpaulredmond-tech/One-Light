const TIME_ZONE = "America/New_York";
const START_HOUR = 12;
const SESSION_MINUTES = 5;
const SESSION_SECONDS = SESSION_MINUTES * 60;

let sessionInterval = null;
let secondsRemaining = SESSION_SECONDS;
let oceanPlaying = false;

const oceanAudio = new Audio("ocean-v2.mp3?v=999");
oceanAudio.loop = true;
oceanAudio.volume = 0.9;

function updateCountdown() {
  const now = new Date();
  const target = new Date();
  target.setHours(12, 0, 0, 0);

  if (now > target) {
    target.setDate(target.getDate() + 1);
  }

  const diff = target - now;
  const seconds = Math.floor(diff / 1000);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  document.getElementById("countdown").innerText =
    h + "h " + m + "m " + s + "s";
}

function startSession() {
  secondsRemaining = SESSION_SECONDS;

  sessionInterval = setInterval(() => {
    secondsRemaining--;

    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;

    document.getElementById("sessionTimer").innerText =
      m + ":" + (s < 10 ? "0" : "") + s;

    if (secondsRemaining <= 0) {
      clearInterval(sessionInterval);
    }
  }, 1000);
}

function toggleOceanSound() {
  if (!oceanPlaying) {
    oceanAudio.play();
    oceanPlaying = true;
    document.getElementById("soundButton").innerText = "Ocean Sound: On";
  } else {
    oceanAudio.pause();
    oceanAudio.currentTime = 0;
    oceanPlaying = false;
    document.getElementById("soundButton").innerText = "Ocean Sound: Off";
  }
}

document.getElementById("beginButton").addEventListener("click", startSession);
document.getElementById("soundButton").addEventListener("click", toggleOceanSound);

setInterval(updateCountdown, 1000);
updateCountdown();
