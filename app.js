const TIME_ZONE = "America/New_York";
const START_HOUR = 12;
const SESSION_MINUTES = 5;
const SESSION_SECONDS = SESSION_MINUTES * 60;

const statusText = document.getElementById("statusText");
const countdownText = document.getElementById("countdownText");
const easternTimeText = document.getElementById("easternTime");
const localTimeText = document.getElementById("localTime");
const endTimeText = document.getElementById("endTime");


const sessionIntro = document.getElementById("sessionIntro");
const sessionTimer = document.getElementById("sessionTimer");
const beginButton = document.getElementById("beginButton");
const soundButton = document.getElementById("soundButton");

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

  if (statusText) statusText.innerText = "Next session";
  if (countdownText) countdownText.innerText = h + "h " + m + "m " + s + "s";

  if (easternTimeText) easternTimeText.innerText = "12:00 PM Eastern Time";
  if (localTimeText) localTimeText.innerText = "Your local time updates automatically";
  if (endTimeText) endTimeText.innerText = "5 minutes after session begins";
}

function startSession() {
  secondsRemaining = SESSION_SECONDS;

  if (sessionIntro) {
    sessionIntro.innerText =
      "Session in progress. Breathe slowly. Let your awareness rest in gratitude, love, and compassion.";
  }

  sessionInterval = setInterval(() => {
    secondsRemaining--;

    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;

    if (sessionTimer) {
      sessionTimer.innerText = m + ":" + (s < 10 ? "0" : "") + s;
    }

    if (secondsRemaining <= 0) {
      clearInterval(sessionInterval);
      sessionInterval = null;
    }
  }, 1000);
}

function toggleOceanSound() {
  if (!soundButton) return;

  if (!oceanPlaying) {
    oceanAudio.play();
    oceanPlaying = true;
    soundButton.innerText = "Ocean Sound: On";
  } else {
    oceanAudio.pause();
    oceanAudio.currentTime = 0;
    oceanPlaying = false;
    soundButton.innerText = "Ocean Sound: Off";
  }
}

if (beginButton) beginButton.addEventListener("click", startSession);
if (soundButton) soundButton.addEventListener("click", toggleOceanSound);

setInterval(updateCountdown, 1000);
updateCountdown();
