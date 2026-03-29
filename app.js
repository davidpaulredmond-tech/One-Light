const TIME_ZONE = "America/New_York";
const START_HOUR_ET = 12;
const START_MINUTE_ET = 0;
const MEDITATION_MINUTES = 5;

const statusText = document.getElementById("statusText");
const countdownText = document.getElementById("countdownText");
const easternTime = document.getElementById("easternTime");
const localTime = document.getElementById("localTime");
const endTime = document.getElementById("endTime");
const notificationStatus = document.getElementById("notificationStatus");
const installStatus = document.getElementById("installStatus");
const installButton = document.getElementById("installButton");
const shareButton = document.getElementById("shareButton");
const notifyButton = document.getElementById("notifyButton");
const calendarButton = document.getElementById("calendarButton");

let deferredPrompt = null;

function getZonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const zoned = getZonedParts(date, timeZone);
  const asUTC = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
    zoned.second
  );
  return (asUTC - date.getTime()) / 60000;
}

function zonedTimeToUtc(parts, timeZone) {
  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const firstOffset = getTimeZoneOffsetMinutes(new Date(utcGuess), timeZone);
  let corrected = utcGuess - firstOffset * 60000;
  const secondOffset = getTimeZoneOffsetMinutes(new Date(corrected), timeZone);
  if (firstOffset !== secondOffset) {
    corrected = utcGuess - secondOffset * 60000;
  }
  return new Date(corrected);
}

function addDaysToZonedDate(parts, daysToAdd) {
  const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + daysToAdd, 12, 0, 0));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

function getMeditationWindow(now = new Date()) {
  const etNow = getZonedParts(now, TIME_ZONE);

  const todayStart = zonedTimeToUtc(
    {
      year: etNow.year,
      month: etNow.month,
      day: etNow.day,
      hour: START_HOUR_ET,
      minute: START_MINUTE_ET,
      second: 0,
    },
    TIME_ZONE
  );
  const todayEnd = new Date(todayStart.getTime() + MEDITATION_MINUTES * 60 * 1000);

  if (now.getTime() < todayEnd.getTime()) {
    return { start: todayStart, end: todayEnd };
  }

  const tomorrow = addDaysToZonedDate(etNow, 1);
  const tomorrowStart = zonedTimeToUtc(
    {
      year: tomorrow.year,
      month: tomorrow.month,
      day: tomorrow.day,
      hour: START_HOUR_ET,
      minute: START_MINUTE_ET,
      second: 0,
    },
    TIME_ZONE
  );
  const tomorrowEnd = new Date(tomorrowStart.getTime() + MEDITATION_MINUTES * 60 * 1000);

  return { start: tomorrowStart, end: tomorrowEnd };
}

function formatCountdown(ms) {
  if (ms <= 0) return "Starting now";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function formatLocal(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function formatEastern(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function getInstallInstructions() {
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);

  if (isIOS) return "On iPhone, tap Share, then Add to Home Screen.";
  if (isAndroid) return "On Android, tap the browser menu, then Add to Home screen or Install app.";
  return "In your browser, choose Install app or Add to Home Screen.";
}

function updateUI() {
  const now = new Date();
  const windowData = getMeditationWindow(now);
  const msUntilStart = windowData.start.getTime() - now.getTime();
  const msUntilEnd = windowData.end.getTime() - now.getTime();
  const isLive = msUntilStart <= 0 && msUntilEnd > 0;

  statusText.textContent = isLive ? "Live now" : "Next session";
  countdownText.textContent = isLive ? "In progress" : formatCountdown(msUntilStart);
  easternTime.textContent = formatEastern(windowData.start);
  localTime.textContent = formatLocal(windowData.start);
  endTime.textContent = formatLocal(windowData.end);
}

async function copyShareLink() {
  const message = "Join me each day at 12:00 PM Eastern for 5 minutes of stillness, gratitude, love, and compassion. One moment. Shared across the world. One Light.";
  if (navigator.share) {
    try {
      await navigator.share({ title: "One Light", text: message, url: window.location.href });
      installStatus.textContent = "Shared successfully.";
      return;
    } catch (_) {}
  }
  try {
    await navigator.clipboard.writeText(window.location.href);
    installStatus.textContent = "Link copied. Share it with anyone you would like to invite.";
  } catch (_) {
    installStatus.textContent = "Could not copy automatically. Share the page link from your browser.";
  }
}

async function enableNotifications() {
  if (!("Notification" in window)) {
    notificationStatus.textContent = "This browser does not support notifications.";
    return;
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    notificationStatus.textContent = "Notifications were not allowed.";
    return;
  }
  notificationStatus.textContent = "Notifications are enabled for this browser. Keep the page installed for the best experience.";
}

function downloadCalendarEvent() {
  const windowData = getMeditationWindow(new Date());
  const start = windowData.start;
  const end = windowData.end;
  const pad = (n) => String(n).padStart(2, "0");
  const formatICS = (value) =>
    `${value.getUTCFullYear()}${pad(value.getUTCMonth() + 1)}${pad(value.getUTCDate())}T${pad(value.getUTCHours())}${pad(value.getUTCMinutes())}${pad(value.getUTCSeconds())}Z`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//One Light//Meditation//EN",
    "BEGIN:VEVENT",
    `UID:onelight-${formatICS(start)}@onelight.app`,
    `DTSTAMP:${formatICS(new Date())}`,
    `DTSTART:${formatICS(start)}`,
    `DTEND:${formatICS(end)}`,
    "SUMMARY:One Light Global Meditation",
    "DESCRIPTION:Join for 5 minutes of peace, love, and gratitude.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "one-light-meditation.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function installApp() {
  if (!deferredPrompt) {
    installStatus.textContent = getInstallInstructions();
    return;
  }
  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  installStatus.textContent =
    choice && choice.outcome === "accepted"
      ? "The app is being added to the home screen."
      : "Installation was dismissed for now.";
  deferredPrompt = null;
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

installButton.addEventListener("click", installApp);
shareButton.addEventListener("click", copyShareLink);
notifyButton.addEventListener("click", enableNotifications);
calendarButton.addEventListener("click", downloadCalendarEvent);

updateUI();
setInterval(updateUI, 1000);
