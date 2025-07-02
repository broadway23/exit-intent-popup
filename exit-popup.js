document.addEventListener('click', (event) => {
  if (event.target && event.target.id === 'claim-btn') {
    const baseUrl = "https://betty.ca/register";
    const utmCampaignValue = "pop_up_150";
    const currentQueryString = window.location.search;
    let newUrl = baseUrl + currentQueryString;
    newUrl = updateQueryStringParameter(newUrl, 'utm_campaign', utmCampaignValue);
    window.location.href = newUrl;
  }
});

function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  } else {
    return uri + separator + key + "=" + value;
  }
}

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function getNextResetTime() {
  const now     = new Date();
  const estOff  = 5 * 60 * 60 * 1000;
  const nowEST  = new Date(now.getTime() - estOff);
  const nextEST = new Date(nowEST);
  nextEST.setHours(6, 0, 0, 0);
  if (nowEST >= nextEST) {
    nextEST.setDate(nextEST.getDate() + 1);
  }
  return new Date(nextEST.getTime() + estOff);
}

function startCountdown() {
  const cutoffTime = new Date("2025-12-30T06:00:00-05:00").getTime();
  let   targetTime = getNextResetTime().getTime();

  const countdownInterval = setInterval(function () {
    const now = Date.now();
    if (now >= cutoffTime) {
      clearInterval(countdownInterval);
      document.querySelectorAll(".countdown-digits").forEach(el => el.innerHTML = "00");
      return;
    }
    if (now >= targetTime) {
      targetTime = getNextResetTime().getTime();
    }
    const distance = targetTime - now;
    let days    = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const update = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = val < 10 ? "0" + val : val;
    };

    update("days-desktop", days);
    update("hours-desktop", hours);
    update("minutes-desktop", minutes);
    update("seconds-desktop", seconds);
  }, 1000);
}

window.addEventListener("DOMContentLoaded", function () {
  let exitIntentShown = sessionStorage.getItem("exitPopupShown") === "true";

  function showExitPopup() {
    if (!exitIntentShown) {
      exitIntentShown = true;
      sessionStorage.setItem("exitPopupShown", "true");
      document.body.style.overflow = "hidden";

      const overlay = document.createElement("div");
      overlay.id = "popup-overlay";
      (document.querySelector("#lp-pom-root") || document.body).appendChild(overlay);

      const popup = document.createElement("div");
      popup.id = "exit-popup";
      popup.innerHTML = `
        <div class="close-btn" id="exit-popup-close">×</div>
        <div class="popup-content">
          <img 
            src="https://broadway23.github.io/exit-modal-image/Exit%20Modal.png" 
            alt="Special Offer" 
            class="popup-image"
          >
          <p>Hurry! Time–Limited Welcome Offer:</p>
          <p>Get <s>100</s> 150 Free Spins Now!</p>
          <div class="countdown-wrapper">
            <div class="countdown-container-desktop">
              <div class="countdown" id="countdown-desktop">
                <div class="time-box">
                  <span id="days-desktop" class="countdown-digits">00</span>
                  <span class="countdown-label">Days</span>
                </div>
                <div class="time-box">
                  <span id="hours-desktop" class="countdown-digits">00</span>
                  <span class="countdown-label">Hours</span>
                </div>
                <div class="time-box">
                  <span id="minutes-desktop" class="countdown-digits">00</span>
                  <span class="countdown-label">Minutes</span>
                </div>
                <div class="time-box">
                  <span id="seconds-desktop" class="countdown-digits">00</span>
                  <span class="countdown-label">Seconds</span>
                </div>
              </div>
            </div>
          </div>
          <div class="button-container">
            <button id="claim-btn">Claim Your Welcome Offer</button>
          </div>
        </div>
      `;
      (document.querySelector("#lp-pom-root") || document.body).appendChild(popup);

      document.getElementById("exit-popup-close").addEventListener("click", () => {
        document.getElementById("exit-popup").remove();
        document.getElementById("popup-overlay").remove();
        document.body.style.overflow = "";
      });

      const waitForCountdownElements = (callback) => {
        const check = setInterval(() => {
          if (document.getElementById("days-desktop")) {
            clearInterval(check);
            callback();
          }
        }, 50);
      };
      waitForCountdownElements(startCountdown);
    }
  }

  if (!isMobile()) {
    document.addEventListener("mouseleave", (e) => { if (e.clientY <= 5) showExitPopup(); });
  }

  let inactivityTimer, inactivityTimeMs = 30000;
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showExitPopup, inactivityTimeMs);
  };
  ["mousemove","keydown","scroll","touchstart"].forEach(evt =>
    document.addEventListener(evt, resetInactivityTimer, { passive: true })
  );
  resetInactivityTimer();

  if (history.pushState) {
    history.pushState({page:1}, "", location.href);
    addEventListener("popstate", () => { showExitPopup(); history.pushState({page:1}, "", location.href); });
  }

  if (isMobile()) {
    let startX=0,startY=0,isTouching=false,swipeThreshold=75;
    addEventListener("touchstart",e=>{
      if(e.touches.length){isTouching=true;startX=e.touches[0].clientX;startY=e.touches[0].clientY;}
    },{passive:true});
    addEventListener("touchend",e=>{
      if(isTouching&&e.changedTouches.length){
        let endX=e.changedTouches[0].clientX,endY=e.changedTouches[0].clientY;
        if(Math.abs(endX-startX)>Math.abs(endY-startY)&&(endX-startX)>swipeThreshold)showExitPopup();
      }
      isTouching=false;
    },{passive:true});
  }

  addEventListener("visibilitychange", () => { if (document.hidden) showExitPopup(); });
});

const style = document.createElement("style");
style.innerHTML = `

@keyframes pulseBorder {
  0%   { box-shadow: 0 0 0 0 rgba(255,199,0,.6); }
  50%  { box-shadow: 0 0 20px 10px rgba(255,199,0,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,199,0,0); }
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
@keyframes glow {
  0% { text-shadow: 0 0 5px #FFC700,0 0 10px #FFC700,0 0 20px #FFC700; }
  50% { text-shadow: 0 0 10px #FFC700,0 0 20px #FFC700,0 0 30px #FFC700; }
  100% { text-shadow: 0 0 5px #FFC700,0 0 10px #FFC700,0 0 20px #FFC700; }
}

#popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 99999;
}

#exit-popup {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
  background: radial-gradient(circle at center, rgba(0,0,0,.95) 20%, rgba(20,20,20,.98) 100%);
  color: #fff; padding: 25px; border-radius: 12px; text-align: center; width: 80%; max-width: 450px;
  border: 2px solid #ffc700; box-shadow: 0 0 25px rgba(255,199,0,.3), 0 0 50px rgba(255,255,255,.1);
  z-index: 100000; animation: pulseBorder 3s infinite; font-family: 'Inter', sans-serif;
}

.close-btn { position: absolute; top: 10px; right: 15px; font: 20px/1 Arial, sans-serif; font-weight: bold; color: #fff; cursor: pointer; transition: .3s; }
.close-btn:hover { transform: scale(1.2); }

.popup-content { display: flex; flex-direction: column; align-items: center; margin-top: 15px; min-height: 400px; }
.popup-image { width: 100%; max-width: 250px; border-radius: 8px; margin-bottom: 15px; }
.popup-content p { font-size: 19px; margin-bottom: 15px; line-height: 1.4; animation: glow 3s ease-in-out infinite; }

.button-container { display: flex; justify-content: center; margin-top: 15px; margin-bottom: 25px; }

#claim-btn {
  background: linear-gradient(#ffc700, #d4af37, #f7e374);
  color: #1c1c1c;
  font: 700 1.2rem "Playfair Display", serif;
  text-transform: uppercase;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
  animation: pulse 2.5s infinite;
  white-space: nowrap;
}
#claim-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255,199,0,.8);
}

@media (max-width: 767px) {
  #claim-btn {
    font-size: 1rem;
    padding: 10px 20px;
    white-space: nowrap;
  }
}

.countdown-wrapper { margin-top: auto; margin-bottom: 10px; }
.countdown-container-desktop { text-align: center; color: #FFC700; font-family: 'Inter', sans-serif; padding: .8rem; margin: auto; max-width: 80%; }
.countdown { display: flex; justify-content: center; gap: 12px; }
.time-box {
  background: rgba(255,199,0,.07); border: 1px solid rgba(255,199,0,.3);
  box-shadow: 0 0 10px rgba(255,199,0,.2); border-radius: 8px; width: 60px; height: 60px;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
}
.countdown-digits { font-size: 1.6rem; font-weight: 700; }
.countdown-label { font-size: .7rem; text-transform: uppercase; margin-top: 2px; }

@media (min-width: 768px) {
  #exit-popup { width: 60%; max-width: 600px; padding: 35px; }
}
`;
document.head.appendChild(style);

document.addEventListener('click', (event) => {
  if (event.target.id === 'claim-btn' || event.target.id === 'exit-popup-close') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'gtm.click', ClickID: event.target.id });
  }
});
