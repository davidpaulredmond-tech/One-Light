const TIME_ZONE = "America/New_York";
const START_HOUR = 12;
const SESSION_MINUTES = 5;
const SESSION_SECONDS = SESSION_MINUTES * 60;
const endButton = document.getElementById("endButton");
const shareButton = document.getElementById("shareButton");
const installStatus = document.getElementById("installStatus");
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

function endSession() {
  if (sessionInterval) {
    clearInterval(sessionInterval);
    sessionInterval = null;
  }

  secondsRemaining = SESSION_SECONDS;

  if (sessionTimer) {
    sessionTimer.innerText = "5:00";
  }

  if (sessionIntro) {
    sessionIntro.innerText = "When you are ready, begin your 5-minute session.";
  }

  if (beginButton) beginButton.style.display = "";
  if (endButton) endButton.style.display = "none";
}
function startSession() {
  if (sessionInterval) {
    clearInterval(sessionInterval);
    sessionInterval = null;
  }

  secondsRemaining = SESSION_SECONDS;

  if (sessionTimer) {
    sessionTimer.innerText = "5:00";
  }

  if (sessionIntro) {
    sessionIntro.innerText =
      "Session in progress. Breathe slowly. Let your awareness rest in gratitude, love, and compassion.";
  }

  if (beginButton) beginButton.style.display = "none";
  if (endButton) endButton.style.display = "";

  sessionInterval = setInterval(() => {
    secondsRemaining--;

    if (secondsRemaining <= 0) {
      endSession();
      return;
    }

    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;

    if (sessionTimer) {
      sessionTimer.innerText = m + ":" + (s < 10 ? "0" : "") + s;
    }
  }, 1000);
}

function toggleOceanSound() {
  if (!soundButton) return;

  if (!oceanPlaying) {
    oceanAudio.play().then(() => {
      oceanPlaying = true;
      soundButton.innerText = "Ocean Sound: On";
    }).catch(() => {
      if (installStatus) {
        installStatus.innerText = "Audio could not start. Tap again.";
      }
    });
  } else {
    oceanAudio.pause();
    oceanAudio.currentTime = 0;
    oceanPlaying = false;
    soundButton.innerText = "Ocean Sound: Off";
  }
}
function copyShareLink() {
  const url = window.location.origin + "/";
  const text =
    "Join me each day at 12:00 PM Eastern for 5 minutes of stillness, gratitude, love, and compassion. One moment. Shared across the world. One Light.";

  if (navigator.share) {
    navigator.share({
      title: "One Light",
      text: text,
      url: url
    }).catch(() => {});
    return;
  }

  navigator.clipboard.writeText(url).then(() => {
    if (installStatus) installStatus.innerText = "Share link copied.";
  }).catch(() => {
    if (installStatus) installStatus.innerText = "Could not copy share link.";
  });
}

if (beginButton) beginButton.addEventListener("click", startSession);
if (endButton) endButton.addEventListener("click", endSession);
if (soundButton) soundButton.addEventListener("click", toggleOceanSound);
if (shareButton) shareButton.addEventListener("click", copyShareLink);

setInterval(updateCountdown, 1000);
updateCountdown();
