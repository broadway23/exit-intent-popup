<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Spin Wheel Exit Modal with Countdown</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
<style>
/* Original styles for the wheel modal */
@keyframes pulse {
0% { transform: scale(1); }
50% { transform: scale(1.1); }
100% { transform: scale(1); }
}
@keyframes glow {
0% { text-shadow: 0 0 5px #FFC700, 0 0 10px #FFC700, 0 0 20px #FFC700; }
50% { text-shadow: 0 0 10px #FFC700, 0 0 20px #FFC700, 0 0 30px #FFC700; }
100% { text-shadow: 0 0 5px #FFC700, 0 0 10px #FFC700, 0 0 20px #FFC700; }
}
.popup button,
button.popup {
width: 220px;
max-width: 90%;
padding: 12px 20px;
font-size: 1rem;
border-radius: 9px;
white-space: nowrap;
}
@media (max-width: 767px) {
.popup button {
width: 350px;
max-width: 90%;
padding: 12px 20px;
font-size: 0.9rem;
}
}
/* Modal styles */
#exit-modal {
position: fixed;
inset: 0;
background: rgba(0, 0, 0, 0.8);
display: none;
justify-content: center;
align-items: center;
z-index: 10000;
}
#exit-modal-content {
background: rgba(0, 0, 0, 0.9);
padding: 20px;
border-radius: 10px;
position: relative;
max-width: 90%;
max-height: 90%;
overflow: auto;
display: flex;
flex-direction: column;
align-items: center;
border: 3px solid #ffc700;
}
#close-modal {
position: absolute;
top: 10px;
right: 15px;
background: transparent;
color: #fff;
font-size: 18px;
font-weight: bold;
border: none;
padding: 0;
cursor: pointer;
line-height: 1;
transition: transform 0.2s ease;
z-index: 10002;
}
#close-modal:hover {
transform: scale(1.2);
}
#modal-text {
color: #fff;
font-size: 1.5rem;
font-weight: bold;
margin-top: 8px;
text-align: center;
}
.offer-heading {
font-family: 'Inter', sans-serif;
font-size: 1.1rem; /* ~20px */
font-weight: 700;
color: #FFFFFF;
margin: 0 0 0.5em;
animation: glow 3s ease-in-out infinite;
}
.offer-subheading {
font-family: 'Inter', sans-serif;
font-size: 1.1rem; /* ~20px */
font-weight: 700;
color: #FFFFFF;
margin: 0;
animation: glow 3s ease-in-out infinite;
}
.offer-subheading s {
color: rgba(255, 199, 0, 0.6);
text-decoration-color: rgba(255, 199, 0, 0.6);
margin-right: 0.3em;
}
/* Win popup styles */
#win-popup {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: rgba(0, 0, 0, 0.89);
color: #fff;
display: none;
flex-direction: column;
justify-content: center;
align-items: center;
text-align: center;
padding: 20px;
border-radius: 10px;
box-sizing: border-box;
z-index: 10001;
}
/* Countdown timer styles */
.countdown-wrapper {
margin-top: 0rem;
margin-bottom: 0rem;
}
/* 25% smaller container (scale down to 75%) */
.countdown-container-desktop {
text-align: center;
color: #FFC700;
font-family: 'Inter', sans-serif;
padding: 0.8rem;
margin: 0 auto;
max-width: 80%;
transform: scale(0.75);
transform-origin: center;
}
/* Preserve equal spacing between boxes */
.countdown {
display: flex;
justify-content: center;
gap: 12px;
}
/* Keep each element a perfect, identical square */
.time-box {
background: rgba(255,199,0,.07);
border: 1px solid rgba(255,199,0,.3);
box-shadow: 0 0 10px rgba(255,199,0,.2);
border-radius: 8px;
width: 60px;
height: 60px;
aspect-ratio: 1 / 1; /* ensures square shape even if content changes */
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
}
.countdown-digits {
font-size: 1.6rem;
font-weight: 700;
}
.countdown-label {
font-size: 0.7rem;
text-transform: uppercase;
margin-top: 2px;
}
</style>
</head>
<body>
<div id="exit-modal" role="dialog" aria-labelledby="modal-text">
<div id="exit-modal-content">
<button id="close-modal" aria-label="Close modal">x</button>
<div id="spin-wheel"></div>
<div id="modal-text">
<p class="offer-heading">Time-Limited Welcome Offer:</p>
<p class="offer-subheading">Spin the Wheel and Win up to 150 Free Spins!</p>
</div>
</div>
</div>
<script>
// Countdown helper functions
/**
* Computes the next daily reset time at 06:00 AM EST. If the current time is
* past the reset time for today, it will return 06:00 AM EST of the following day.
* @returns {Date} The next reset Date object.
*/
function getNextResetTime() {
const now = new Date();
const estOffset = 5 * 60 * 60 * 1000;
const nowEST = new Date(now.getTime() - estOffset);
const nextEST = new Date(nowEST);
nextEST.setHours(6, 0, 0, 0);
if (nowEST >= nextEST) {
nextEST.setDate(nextEST.getDate() + 1);
}
return new Date(nextEST.getTime() + estOffset);
}
/**
* Starts a countdown timer that updates every second. The timer counts down to
* the next 06:00 AM EST. After December 30, 2025 at 06:00 AM EST, the timer
* stops and shows "00" for all units. The DOM must contain elements with
* ids 'days-desktop', 'hours-desktop', 'minutes-desktop', and
* 'seconds-desktop'.
*/
function startCountdown() {
const cutoffTime = new Date("2025-12-30T06:00:00-05:00").getTime();
let targetTime = getNextResetTime().getTime();
const countdownInterval = setInterval(() => {
const now = Date.now();
if (now >= cutoffTime) {
clearInterval(countdownInterval);
document.querySelectorAll(".countdown-digits").forEach(el => {
el.innerHTML = "00";
});
return;
}
if (now >= targetTime) {
targetTime = getNextResetTime().getTime();
}
const distance = targetTime - now;
const days = Math.floor(distance / (1000 * 60 * 60 * 24));
const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((distance % (1000 * 60)) / 1000);
const update = (id, val) => {
const el = document.getElementById(id);
if (el) el.innerHTML = val < 10 ? "0" + val : String(val);
};
update("days-desktop", days);
update("hours-desktop", hours);
update("minutes-desktop", minutes);
update("seconds-desktop", seconds);
}, 1000);
}
document.addEventListener("DOMContentLoaded", function() {
const modal = document.getElementById("exit-modal");
const modalContent = document.getElementById("exit-modal-content");
const closeModalBtn = document.getElementById("close-modal");
let exitIntentShown = sessionStorage.getItem("exitPopupShown") === "true";
let lastTrigger = 0;
const debounceMs = 1000;
function showExitPopup() {
if (!exitIntentShown && Date.now() - lastTrigger > debounceMs) {
modal.style.display = "flex";
exitIntentShown = true;
sessionStorage.setItem("exitPopupShown", "true");
lastTrigger = Date.now();
requestAnimationFrame(animate);
}
}
const isMobile = () => window.innerWidth <= 768;
if (!isMobile()) {
document.addEventListener("mouseleave", (e) => {
if (e.clientY <= 5) showExitPopup();
});
}
let inactivityTimer;
const inactivityTimeMs = 60000;
const resetInactivityTimer = () => {
clearTimeout(inactivityTimer);
inactivityTimer = setTimeout(showExitPopup, inactivityTimeMs);
};
["mousemove", "keydown", "scroll", "touchstart"].forEach(evt =>
document.addEventListener(evt, resetInactivityTimer, { passive: true })
);
resetInactivityTimer();
if (history.pushState) {
history.pushState({ page: 1 }, "", location.href);
addEventListener("popstate", () => {
showExitPopup();
history.pushState({ page: 1 }, "", location.href);
});
}
if (isMobile()) {
let startX = 0, startY = 0, isTouching = false;
const swipeThreshold = 100;
addEventListener("touchstart", e => {
if (e.touches.length) {
isTouching = true;
startX = e.touches[0].clientX;
startY = e.touches[0].clientY;
}
}, { passive: true });
addEventListener("touchend", e => {
if (isTouching && e.changedTouches.length) {
const endX = e.changedTouches[0].clientX;
const endY = e.changedTouches[0].clientY;
const horizontalSwipe = Math.abs(endX - startX) > Math.abs(endY - startY);
if (horizontalSwipe && (endX - startX) > swipeThreshold) {
showExitPopup();
}
}
isTouching = false;
}, { passive: true });
}
document.addEventListener("visibilitychange", () => {
if (document.hidden) showExitPopup();
});
let lastScrollTop = window.scrollY;
let lastScrollTime = Date.now();
const fastScrollUpThreshold = {
deltaY: -100,
deltaTime: 200
};
window.addEventListener('scroll', () => {
const now = Date.now();
const currentScrollTop = window.scrollY;
const scrollDelta = currentScrollTop - lastScrollTop;
const timeDelta = now - lastScrollTime;
if (
scrollDelta < fastScrollUpThreshold.deltaY &&
timeDelta < fastScrollUpThreshold.deltaTime
) {
showExitPopup();
}
lastScrollTop = currentScrollTop;
lastScrollTime = now;
}, { passive: true });
closeModalBtn.addEventListener("click", () => {
modal.style.display = "none";
});
closeModalBtn.addEventListener("keydown", e => {
if (e.key === "Enter" || e.key === " ") {
modal.style.display = "none";
}
});
const allParams = (window.location.search || '').replace(/^\?/, '');
const container = document.getElementById("spin-wheel");
container.style.position = "relative";
container.style.display = "flex";
container.style.flexDirection = "column";
container.style.alignItems = "center";
container.style.justifyContent = "center";
container.style.background = "transparent";
container.style.color = "#fff";
const isMobileDevice = isMobile();
const scaleFactor = isMobileDevice ? 0.9 : 1.4;
const baseSize = 300;
const canvasSize = baseSize * scaleFactor;
container.style.padding = `${1 * scaleFactor}px 0`;
const dpr = window.devicePixelRatio || 1;
const canvas = document.createElement("canvas");
canvas.width = canvasSize * dpr;
canvas.height = canvasSize * dpr;
canvas.style.width = `${canvasSize}px`;
canvas.style.height = `${canvasSize}px`;
canvas.style.borderRadius = "50%";
canvas.style.boxShadow = `0 0 ${15 * scaleFactor}px rgba(255,255,255,0.3)`;
canvas.style.cursor = "pointer";
container.appendChild(canvas);
const arrow = document.createElement("img");
arrow.src = "https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/353d89f8-6654-4f6d-aa6e-ff303216f8f0/fewgweg-removebg-preview.small.png";
arrow.onerror = () => console.error("Failed to load arrow image");
arrow.style.position = "absolute";
arrow.style.top = `${-18 * scaleFactor}px`;
arrow.style.left = "50%";
arrow.style.transform = "translateX(-50%)";
arrow.style.width = `${60 * scaleFactor}px`;
arrow.style.height = `${60 * scaleFactor}px`;
arrow.style.filter = `drop-shadow(0 0 ${10 * scaleFactor}px #ffc700)`;
container.appendChild(arrow);
const modalTextEl = document.getElementById("modal-text");
const countdownWrapper = document.createElement("div");
countdownWrapper.className = "countdown-wrapper";
const countdownContainer = document.createElement("div");
countdownContainer.className = "countdown-container-desktop";
const countdownDiv = document.createElement("div");
countdownDiv.className = "countdown";
const createTimeBox = (id, label) => {
const box = document.createElement("div");
box.className = "time-box";
const digits = document.createElement("span");
digits.id = id;
digits.className = "countdown-digits";
digits.innerHTML = "00";
const lbl = document.createElement("span");
lbl.className = "countdown-label";
lbl.innerText = label;
box.appendChild(digits);
box.appendChild(lbl);
return box;
};
countdownDiv.appendChild(createTimeBox("days-desktop", "Days"));
countdownDiv.appendChild(createTimeBox("hours-desktop", "Hours"));
countdownDiv.appendChild(createTimeBox("minutes-desktop", "Minutes"));
countdownDiv.appendChild(createTimeBox("seconds-desktop", "Seconds"));
countdownContainer.appendChild(countdownDiv);
countdownWrapper.appendChild(countdownContainer);
modalContent.insertBefore(countdownWrapper, modalTextEl);
startCountdown();
const spinButton = document.createElement("button");
spinButton.innerText = "SPIN THE WHEEL";
spinButton.className = "popup";
spinButton.style.backgroundImage = "linear-gradient(to bottom, #FFEBA5 0%, #FFC700 100%)";
spinButton.style.color = "#000";
spinButton.style.border = "none";
spinButton.style.cursor = "pointer";
spinButton.style.fontWeight = "bold";
spinButton.style.marginTop = "20px";
spinButton.addEventListener("click", spinWheel);
spinButton.addEventListener("keydown", e => {
if (e.key === "Enter" || e.key === " ") spinWheel();
});
modalContent.appendChild(spinButton);
const slices = [
{
gradientColors: ["#ecc440", "#fffa8a", "#ddac17", "#ffff95"],
image: "https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/8036d011-9999-45cd-8835-ea0157b8a9f7/110-preview.small.png",
popupMessage: "",
popupImage: "",
popupTextSize: `${17 * scaleFactor}px`
},
{
gradientColors: ["#ab2330", "#d10000", "#800000"],
image: "https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/354bccd9-3d52-47f2-9ac8-9c3891e7144a/150fs.small.png",
popupMessage: "",
popupImage: "https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/354bccd9-3d52-47f2-9ac8-9c3891e7144a/150fs.small.png",
popupTextSize: `${17 * scaleFactor}px`
},
{
gradientColors: ["#ecc440", "#fffa8a", "#ddac17", "#ffff95"],
image: "https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/8036d011-9999-45cd-8835-ea0157b8a9f7/110-preview.small.png",
popupMessage: "",
popupImage: "",
popupTextSize: `${17 * scaleFactor}px`
},
{
color: "#000000",
image: "https://user-assets-unbounce-com.s3.amazonaws.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/6cd66bad-ae30-4081-b6a4-95fc28f2d9b7/100fs.small.png",
popupMessage: "",
popupImage: "",
popupTextSize: `${20 * scaleFactor}px`
},
{
gradientColors: ["#ecc440", "#fffa8a", "#ddac17", "#ffff95"],
image: "https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/8036d011-9999-45cd-8835-ea0157b8a9f7/110-preview.small.png",
popupMessage: "",
popupImage: "",
popupTextSize: `${20 * scaleFactor}px`
},
{
color: "#000000",
image: "https://user-assets-unbounce-com.s3.amazonaws.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/6cd66bad-ae30-4081-b6a4-95fc28f2d9b7/100fs.small.png",
popupMessage: "",
popupImage: "",
popupTextSize: `${20 * scaleFactor}px`
},
{
gradientColors: ["#ecc440", "#fffa8a", "#ddac17", "#ffff95"],
image: "https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/8036d011-9999-45cd-8835-ea0157b8a9f7/110-preview.small.png",
popupMessage: "",
popupImage: "",
popupTextSize: `${20 * scaleFactor}px`
},
{
color: "#000000",
image: "https://user-assets-unbounce-com.s3.amazonaws.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/6cd66bad-ae30-4081-b6a4-95fc28f2d9b7/100fs.small.png",
popupMessage: "",
popupImage: "",
popupTextSize: `${20 * scaleFactor}px`
}
];
let startAngle = 0;
let spinning = false;
let spinResultIndex = 0;
let studAnimationCounter = 0;
const studCount = 8;
let borderRotationAngle = 0;
let spinStartTime = 0;
const spinDuration = 6000;
let initialAngle = 0;
let finalAngle = 0;
const borderLineWidth = 19 * scaleFactor;
const borderRadius = (canvasSize / 2) - (5 * scaleFactor);
const studDistance = borderRadius - (2 * scaleFactor);
slices.forEach(slice => {
const img = new Image();
img.src = slice.image;
img.onerror = () => console.error(`Failed to load slice image: ${slice.image}`);
slice.imageObj = img;
});
const logo = new Image();
logo.src = "https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/b95e4b60-270a-4511-b949-0ec4e06c92e9/blackbutton-removebg-preview.small.png";
logo.onerror = () => console.error("Failed to load logo image");
function drawWheel() {
const ctx = canvas.getContext("2d");
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.save();
ctx.scale(dpr, dpr);
const arc = (Math.PI * 2) / slices.length;
for (let i = 0; i < slices.length; i++) {
const slice = slices[i];
const angle = startAngle + i * arc;
let fillStyle = slice.color || "#fff";
if (slice.gradientColors) {
const g = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
slice.gradientColors.forEach((c, idx) =>
g.addColorStop(idx / (slice.gradientColors.length - 1), c)
);
fillStyle = g;
}
ctx.save();
ctx.shadowColor = "rgba(0,0,0,0.4)";
ctx.shadowBlur = 6 * scaleFactor;
ctx.shadowOffsetX = 3 * scaleFactor;
ctx.shadowOffsetY = 3 * scaleFactor;
ctx.beginPath();
ctx.moveTo(canvasSize / 2, canvasSize / 2);
ctx.arc(
canvasSize / 2, canvasSize / 2,
(canvasSize / 2) - (15 * scaleFactor),
angle, angle + arc, false
);
ctx.closePath();
ctx.fillStyle = fillStyle;
ctx.fill();
ctx.lineWidth = 1.5 * scaleFactor;
ctx.strokeStyle = "#ffffff";
ctx.stroke();
ctx.restore();
const midAngle = angle + arc / 2;
const imgRadius = ((canvasSize / 2) - (17 * scaleFactor)) * 0.75;
const imgX = (canvasSize / 2) + imgRadius * Math.cos(midAngle);
const imgY = (canvasSize / 2) + imgRadius * Math.sin(midAngle);
const imgSize = 60 * scaleFactor;
if (slice.imageObj.complete) {
ctx.drawImage(
slice.imageObj,
imgX - imgSize / 2, imgY - imgSize / 2,
imgSize, imgSize
);
}
}
ctx.save();
ctx.translate(canvasSize / 2, canvasSize / 2);
ctx.rotate(borderRotationAngle);
const bg = ctx.createLinearGradient(
-canvasSize / 2, -canvasSize / 2,
canvasSize / 2, canvasSize / 2
);
["#F9F295", "#E0AA3E", "#FAF398", "#B88A44", "#F9F295"].forEach((c, i) =>
bg.addColorStop(i / 4, c)
);
ctx.save();
ctx.shadowColor = "rgba(0,0,0,0.5)";
ctx.shadowBlur = 8 * scaleFactor;
ctx.shadowOffsetX = 2 * scaleFactor;
ctx.shadowOffsetY = 2 * scaleFactor;
ctx.beginPath();
ctx.arc(0, 0, borderRadius, 0, Math.PI * 2);
ctx.lineWidth = borderLineWidth;
ctx.strokeStyle = bg;
ctx.stroke();
ctx.restore();
const pulse = 1 + 0.2 * Math.sin(studAnimationCounter * 3);
for (let i = 0; i < studCount; i++) {
const a = i * (360/studCount)*(Math.PI/180);
const x = studDistance * Math.cos(a);
const y = studDistance * Math.sin(a);
ctx.save();
const studRadius = 7 * scaleFactor;
const gradient = ctx.createRadialGradient(
x - studRadius * 0.3, y - studRadius * 0.3, studRadius * 0.1,
x, y, studRadius
);
gradient.addColorStop(0, "rgba(255,255,255,0.95)");
gradient.addColorStop(0.4, "rgba(220,220,255,0.7)");
gradient.addColorStop(0.7, "rgba(200,200,255,0.5)");
gradient.addColorStop(1, "rgba(180,180,255,0.3)");
ctx.shadowColor = "rgba(200,200,255,0.9)";
ctx.shadowBlur = 20 * scaleFactor * pulse;
ctx.beginPath();
ctx.arc(x, y, studRadius, 0, Math.PI*2);
ctx.fillStyle = gradient;
ctx.fill();
ctx.save();
ctx.clip();
ctx.beginPath();
ctx.arc(x, y, studRadius, 0, Math.PI*2);
ctx.fillStyle = "rgba(0,0,0,0.15)";
ctx.fill();
ctx.beginPath();
ctx.arc(x - studRadius * 0.15, y - studRadius * 0.15, studRadius * 0.85, 0, Math.PI*2);
ctx.fillStyle = gradient;
ctx.fill();
ctx.restore();
ctx.beginPath();
ctx.arc(x - studRadius * 0.5, y - studRadius * 0.5, studRadius * 0.25, 0, Math.PI*2);
ctx.fillStyle = "rgba(255,255,255,0.85)";
ctx.fill();
ctx.beginPath();
ctx.arc(x + studRadius * 0.3, y + studRadius * 0.3, studRadius * 0.15, 0, Math.PI*2);
ctx.fillStyle = "rgba(255,255,255,0.6)";
ctx.fill();
ctx.closePath();
ctx.restore();
}
ctx.restore();
const logoSize = canvasSize * 0.25;
ctx.save();
ctx.translate(canvasSize / 2, canvasSize / 2);
if (!spinning) {
const tNow = performance.now();
const pulse = 1 + 0.05 * Math.sin(tNow * 0.005);
ctx.scale(pulse, pulse);
}
ctx.shadowColor = "rgba(0,0,0,0.4)";
ctx.shadowBlur = 8 * scaleFactor;
ctx.shadowOffsetX = 2 * scaleFactor;
ctx.shadowOffsetY = 2 * scaleFactor;
if (logo.complete) {
ctx.drawImage(logo, -logoSize / 2, -logoSize / 2, logoSize, logoSize);
}
ctx.restore();
ctx.restore();
}
let animationFrame;
function animate(ts) {
if (modal.style.display === "none" && !spinning) {
cancelAnimationFrame(animationFrame);
return;
}
if (spinning) {
const elapsed = ts - spinStartTime;
if (elapsed < spinDuration) {
const t = elapsed / spinDuration;
const eased = 1 - Math.pow(1 - t, 3);
startAngle = initialAngle + eased * (finalAngle - initialAngle);
} else {
spinning = false;
startAngle = finalAngle;
showCongratulationsPopup(spinResultIndex);
}
}
studAnimationCounter += 0.02;
borderRotationAngle -= 0.005;
drawWheel();
animationFrame = requestAnimationFrame(animate);
}
function spinWheel() {
if (spinning || winPopup.style.display === "flex") return;
spinning = true;
spinStartTime = performance.now();
const arc = (Math.PI * 2) / slices.length;
spinResultIndex = 1;
const baseAngle = -Math.PI / 2 - (spinResultIndex + 0.5) * arc;
const currentAngle = startAngle;
let needed = (currentAngle + 6 * Math.PI - baseAngle) / (2 * Math.PI);
let K = Math.ceil(needed);
if (K < 0) K = 0;
K += Math.floor(Math.random() * 3);
finalAngle = baseAngle + K * 2 * Math.PI;
initialAngle = currentAngle;
requestAnimationFrame(animate);
}
const winPopup = document.createElement("div");
winPopup.id = "win-popup";
modalContent.appendChild(winPopup);
const popupImg = document.createElement("img");
popupImg.style.width = "100%";
popupImg.style.maxWidth = `${175 * scaleFactor}px`;
popupImg.style.margin = `0 auto ${10 * scaleFactor}px`;
winPopup.appendChild(popupImg);
const winMessage = document.createElement("div");
winMessage.style.marginBottom = `${10 * scaleFactor}px`;
winPopup.appendChild(winMessage);
const buttonsContainer = document.createElement("div");
buttonsContainer.style.display = "flex";
buttonsContainer.style.justifyContent = "center";
buttonsContainer.style.alignItems = "center";
buttonsContainer.style.flexWrap = "wrap";
buttonsContainer.style.gap = `${20 * scaleFactor}px`;
winPopup.appendChild(buttonsContainer);
const redirectUrls = {
default: `https://betty.ca/register?utm_campaign=pop_up_150_wheel&${allParams}`
};
function getRedirectUrl(idx) {
return redirectUrls[idx] || redirectUrls.default;
}
function showCongratulationsPopup(idx) {
const s = slices[idx];
buttonsContainer.innerHTML = "";
buttonsContainer.style.marginTop = `${30 * scaleFactor}px`;
if (idx === 1) {
winMessage.innerHTML = `
<p class="offer-heading">You’ve won 150 Free Spins!</p>
<p class="offer-subheading">Use them on a game of your choice!</p>
`;
popupImg.src = s.popupImage;
} else if (idx === 3 || idx === 5) {
winMessage.innerHTML = ``;
winMessage.style.fontSize = `${17 * scaleFactor}px`;
popupImg.src = slices[3].popupImage;
} else {
winMessage.innerText = s.popupMessage;
winMessage.style.fontSize = s.popupTextSize;
popupImg.src = s.popupImage;
}
const redirectUrl = getRedirectUrl(idx);
if (idx === 3 || idx === 5) {
buttonsContainer.style.flexDirection = "column";
const claimBtn = document.createElement("button");
claimBtn.innerText = "Claim Your Reward";
claimBtn.className = "popup";
claimBtn.style.backgroundImage = "linear-gradient(to bottom, #FFEBA5 0%, #FFC700 100%)";
claimBtn.style.color = "#000";
claimBtn.style.border = "none";
claimBtn.style.cursor = "pointer";
claimBtn.style.fontWeight = "bold";
claimBtn.style.animation = "pulse 1s infinite";
claimBtn.addEventListener("click", e => {
e.preventDefault();
e.stopPropagation();
window.location.href = redirectUrl;
});
claimBtn.addEventListener("touchend", claimBtn.onclick);
buttonsContainer.appendChild(claimBtn);
const againBtn = document.createElement("button");
againBtn.innerText = "Spin One More Time";
againBtn.className = "popup";
againBtn.style.background = "#fff";
againBtn.style.color = "#000";
againBtn.style.border = "none";
againBtn.style.cursor = "pointer";
againBtn.style.fontWeight = "bold";
againBtn.addEventListener("click", () => {
winPopup.style.display = "none";
spinWheel();
});
buttonsContainer.appendChild(againBtn);
} else {
const claimBtn = document.createElement("button");
claimBtn.innerText = "Get Your Bonus Now";
claimBtn.className = "popup";
claimBtn.style.backgroundImage = "linear-gradient(to bottom, #FFEBA5 0%, #FFC700 100%)";
claimBtn.style.color = "#000";
claimBtn.style.border = "none";
claimBtn.style.cursor = "pointer";
claimBtn.style.fontWeight = "bold";
claimBtn.style.animation = "pulse 1s infinite";
claimBtn.addEventListener("click", e => {
e.preventDefault();
e.stopPropagation();
window.location.href = redirectUrl;
});
claimBtn.addEventListener("touchend", claimBtn.onclick);
buttonsContainer.appendChild(claimBtn);
}
winPopup.style.display = "flex";
}
canvas.addEventListener("click", spinWheel);
logo.onload = () => {
if (modal.style.display !== "none" || spinning) {
requestAnimationFrame(animate);
}
};
});
</script>
</body>
</html>
