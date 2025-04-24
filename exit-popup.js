console.log("✅ Exit Popup JS — Version 4 — Apr 24, 3:45PM");
// URL
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

// Update Query Parameter
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

// EXIT POPUP
window.addEventListener("DOMContentLoaded", function () {
  let exitIntentShown = sessionStorage.getItem("exitPopupShown") === "true";

  // Countdown timer
  function startCountdown() {
  let countdownEndDate = new Date("2025-04-30T00:00:00-04:00");
  let targetTime = countdownEndDate.getTime();

  let countdownInterval = setInterval(function() {
    let now = new Date().getTime();
    let distance = targetTime - now;
    if (distance < 0) {
      clearInterval(countdownInterval);
      document.querySelectorAll(".countdown-digits").forEach(el => {
        if (el) el.innerHTML = "00";
      });
      return;
    }

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
  
  function showExitPopup() {
    if (!exitIntentShown) {
      exitIntentShown = true;
      sessionStorage.setItem("exitPopupShown", "true");
      
      document.body.style.overflow = "hidden";

      const popup = document.createElement("div");
      popup.id = "exit-popup";
      popup.innerHTML = `
        <div class="close-btn" id="exit-popup-close">×</div>
        <div class="popup-content">
          <img 
            src="https://user-assets-unbounce-com.s3.amazonaws.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/6ca741d3-890a-4b1e-8a76-e583b317b80a/100-50.original.png" 
            alt="Special Offer" 
            class="popup-image"
          >
          <p>Hurry! Time–Limited Welcome Offer:</p>
          <p>Get 150 Free Spins Now!</p>

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
            <button id="claim-btn">Claim Your Welcome Offer Now</button>
          </div>
        </div>
      `;
      
      let unbounceContainer = document.querySelector("#lp-pom-root") || document.body;
      unbounceContainer.appendChild(popup);

      document.getElementById("exit-popup-close").addEventListener("click", function () {
        document.getElementById("exit-popup").remove();
        document.body.style.overflow = "";
      });

      console.log("Exit popup displayed.");
      startCountdown();
    }
  }

  // TRIGGER #1 (Desktop): Mouse leaves top

  if (!isMobile()) {
    document.addEventListener("mouseleave", function (event) {
      if (event.clientY <= 5) {
        showExitPopup();
      }
    });
  }

  // TRIGGER #2 (Both Desktop & Mobile): Inactivity 30s
  let inactivityTimeMs = 30000; 
  let inactivityTimer;
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(function() {
      showExitPopup();
    }, inactivityTimeMs);
  }
  ["mousemove", "keydown", "scroll", "touchstart"].forEach(evt => {
    document.addEventListener(evt, resetInactivityTimer, { passive: true });
  });
  resetInactivityTimer();

  // TRIGGER #3: Back button detection (mobile & desktop)
  if (window.history && window.history.pushState) {
    window.history.pushState({ page: 1 }, "", window.location.href);
    window.addEventListener("popstate", function(event) {
      showExitPopup();
      window.history.pushState({ page: 1 }, "", window.location.href);
    });
  }

  // TRIGGER #5 (Mobile): Swipe from left to right
  if (isMobile()) {
    let startX = 0, startY = 0, isTouching = false, swipeThreshold = 75;
    document.addEventListener("touchstart", function(e) {
      if (e.touches.length > 0) {
        isTouching = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    }, { passive: true });
    document.addEventListener("touchmove", function(e) {}, { passive: true });
    document.addEventListener("touchend", function(e) {
      if (isTouching && e.changedTouches.length > 0) {
        let endX = e.changedTouches[0].clientX;
        let endY = e.changedTouches[0].clientY;
        let distX = endX - startX;
        let distY = endY - startY;
        if (Math.abs(distX) > Math.abs(distY) && distX > swipeThreshold) {
          showExitPopup();
        }
      }
      isTouching = false;
    }, { passive: true });
  }

  // TRIGGER #6 (Both): Tab Switch
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      showExitPopup();
    }
  });
});

const style = document.createElement("style");
style.innerHTML = `

@keyframes pulseBorder {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 199, 0, 0.6);
  }
  50% {
    box-shadow: 0 0 20px 10px rgba(255, 199, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 199, 0, 0);
  }
}
@keyframes pulseClaim {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}
@keyframes glow {
  0% {
    text-shadow: 0 0 5px #FFC700, 0 0 10px #FFC700, 0 0 20px #FFC700;
  }
  50% {
    text-shadow: 0 0 10px #FFC700, 0 0 20px #FFC700, 0 0 30px #FFC700;
  }
  100% {
    text-shadow: 0 0 5px #FFC700, 0 0 10px #FFC700, 0 0 20px #FFC700;
  }
}

#exit-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.95) 20%, rgba(20, 20, 20, 0.98) 100%);
  color: #fff;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  width: 80%;
  max-width: 450px;
  border: 2px solid #ffc700;
  box-shadow: 0 0 25px rgba(255, 199, 0, 0.3), 0 0 50px rgba(255, 255, 255, 0.1);
  z-index: 100000;
  animation: pulseBorder 3s infinite;
  font-family: 'Inter', sans-serif;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  font-family: Arial, sans-serif;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  transition: 0.3s;
}
.close-btn:hover {
  transform: scale(1.2);
}

.popup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
  min-height: 400px;
}

.popup-image {
  width: 100%;
  max-width: 250px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.popup-content p {
  font-size: 19px;
  margin-bottom: 15px;
  line-height: 1.4;
  animation: glow 3s ease-in-out infinite;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 15px;
  margin-bottom: 25px;
}

#claim-btn {
  width: 280px;
  height: 45px;
  padding: 10px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: 0.3s;
  text-align: center;
  background: #ffc700;
  color: #000;
  font-weight: bold;
  animation: pulseClaim 3s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(255, 199, 0, 0.7);
}
#claim-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 199, 0, 0.9);
}

.countdown-wrapper {
  margin-top: auto;
  margin-bottom: 10px;
}

.countdown-container-desktop {
  text-align: center;
  color: #FFC700;
  font-family: 'Inter', sans-serif;
  padding: 0.8rem;
  margin: auto;
  max-width: 80%;
}

.countdown-container-desktop .countdown {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.time-box {
  background: rgba(255, 199, 0, 0.07);
  border: 1px solid rgba(255, 199, 0, 0.3);
  box-shadow: 0 0 10px rgba(255, 199, 0, 0.2);
  border-radius: 8px;
  width: 60px;
  height: 60px;
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

/* Larger desktops */
@media (min-width: 768px) {
  #exit-popup {
    width: 60%;
    max-width: 600px;
    padding: 35px;
  }
}
`;
document.head.appendChild(style);

// GA tracking
document.addEventListener('click', function(event) {
  if (event.target.id === 'claim-btn' || event.target.id === 'exit-popup-close') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'gtm.click',
      ClickID: event.target.id
    });
  }
});
