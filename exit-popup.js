    (function() {
        // Pick an A/B variant and persist it for the current session
        var abVariant = sessionStorage.getItem('abVariant');
        if (!abVariant) {
            abVariant = Math.random() < 0.5 ? 'popup' : 'wheel';
            sessionStorage.setItem('abVariant', abVariant);
        }


        function initPopupVariant() {
            document.addEventListener('click', function(event) {
                // Handle clicks on the call‑to‑action button
                if (event.target && event.target.id === 'claim-btn') {
                    var baseUrl = 'https://betty.ca/register';
                    var utmCampaignValue = 'pop_up_150_regular';
                    var currentQueryString = window.location.search;
                    var newUrl = baseUrl + currentQueryString;
                    newUrl = updateQueryStringParameter(newUrl, 'utm_campaign', utmCampaignValue);
                    window.location.href = newUrl;
                }
                // Send click information to the dataLayer for GTM
                if (event.target.id === 'claim-btn' || event.target.id === 'exit-popup-close') {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: 'gtm.click',
                        ClickID: event.target.id
                    });
                }
            });

            // Replace or append the given query parameter in a URL
            function updateQueryStringParameter(uri, key, value) {
                var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
                var separator = uri.indexOf('?') !== -1 ? '&' : '?';
                return uri.match(re) ? uri.replace(re, '$1' + key + '=' + value + '$2') : uri + separator + key + '=' + value;
            }

            // Basic mobile detection to avoid triggering exit intent on small screens
            function isMobile() {
                return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            }

            // Compute the next 06:00 AM Eastern Standard Time reset
            function getNextResetTime() {
                var now = new Date();
                var estOffset = 5 * 60 * 60 * 1000; // EST offset in milliseconds
                var nowEST = new Date(now.getTime() - estOffset);
                var nextEST = new Date(nowEST);
                nextEST.setHours(6, 0, 0, 0);
                if (nowEST >= nextEST) {
                    nextEST.setDate(nextEST.getDate() + 1);
                }
                return new Date(nextEST.getTime() + estOffset);
            }

            // Initialise the countdown timer and update the DOM every second
            function startCountdown() {
                var cutoffTime = new Date('2025-12-30T06:00:00-05:00').getTime();
                var targetTime = getNextResetTime().getTime();
                var countdownInterval = setInterval(function() {
                    var now = Date.now();
                    // After the cutoff date, freeze the countdown at zero
                    if (now >= cutoffTime) {
                        clearInterval(countdownInterval);
                        document.querySelectorAll('.countdown-digits').forEach(function(el) {
                            el.innerHTML = '00';
                        });
                        return;
                    }
                    // When reaching the next reset, compute the following one
                    if (now >= targetTime) {
                        targetTime = getNextResetTime().getTime();
                    }
                    var distance = targetTime - now;
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    var update = function(id, val) {
                        var el = document.getElementById(id);
                        if (el) el.innerHTML = val < 10 ? '0' + val : val;
                    };
                    update('days-desktop', days);
                    update('hours-desktop', hours);
                    update('minutes-desktop', minutes);
                    update('seconds-desktop', seconds);
                }, 1000);
            }

            window.addEventListener('DOMContentLoaded', function() {
                var exitIntentShown = sessionStorage.getItem('exitPopupShown') === 'true';

                // Append overlay and modal elements when triggered
                function showExitPopup() {
                    if (exitIntentShown) return;
                    exitIntentShown = true;
                    sessionStorage.setItem('exitPopupShown', 'true');
                    document.body.style.overflow = 'hidden';

                    var overlay = document.createElement('div');
                    overlay.id = 'popup-overlay';
                    (document.querySelector('#lp-pom-root') || document.body).appendChild(overlay);

                    var popup = document.createElement('div');
                    popup.id = 'exit-popup';
                    // Assign the popup HTML using a template literal to avoid syntax errors
                    popup.innerHTML = `
          <div class="close-btn" id="exit-popup-close">×</div>
          <div class="popup-content">
            <img src="https://broadway23.github.io/exit-modal-image/Exit%20Modal.png" alt="Special Offer" class="popup-image">
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
                    (document.querySelector('#lp-pom-root') || document.body).appendChild(popup);

                    document.getElementById('exit-popup-close').addEventListener('click', function() {
                        var exitPopup = document.getElementById('exit-popup');
                        var popupOverlay = document.getElementById('popup-overlay');
                        if (exitPopup) exitPopup.remove();
                        if (popupOverlay) popupOverlay.remove();
                        document.body.style.overflow = '';
                    });

                    // Wait until countdown elements are attached before starting timer
                    var waitForCountdownElements = function(callback) {
                        var check = setInterval(function() {
                            if (document.getElementById('days-desktop')) {
                                clearInterval(check);
                                callback();
                            }
                        }, 50);
                    };
                    waitForCountdownElements(startCountdown);
                }

                // Desktop exit intent – trigger when mouse leaves viewport
                if (!isMobile()) {
                    document.addEventListener('mouseleave', function(e) {
                        if (e.clientY <= 5) showExitPopup();
                    }, {
                        passive: true
                    });
                }
                // Inactivity timer – show modal after user idle for 30s
                var inactivityTimer;
                var inactivityTimeMs = 30000;
                var resetInactivityTimer = function() {
                    clearTimeout(inactivityTimer);
                    inactivityTimer = setTimeout(showExitPopup, inactivityTimeMs);
                };
                ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(function(evt) {
                    document.addEventListener(evt, resetInactivityTimer, {
                        passive: true
                    });
                });
                resetInactivityTimer();
                // Trigger on browser back button
                if (history.pushState) {
                    history.pushState({
                        page: 1
                    }, '', location.href);
                    window.addEventListener('popstate', function() {
                        showExitPopup();
                        history.pushState({
                            page: 1
                        }, '', location.href);
                    });
                }
                // Touch devices: swipe right from left edge shows popup
                if (isMobile()) {
                    var startX = 0,
                        startY = 0,
                        isTouching = false;
                    var swipeThreshold = 75;
                    window.addEventListener('touchstart', function(e) {
                        if (e.touches.length) {
                            isTouching = true;
                            startX = e.touches[0].clientX;
                            startY = e.touches[0].clientY;
                        }
                    }, {
                        passive: true
                    });
                    window.addEventListener('touchend', function(e) {
                        if (isTouching && e.changedTouches.length) {
                            var endX = e.changedTouches[0].clientX;
                            var endY = e.changedTouches[0].clientY;
                            if (Math.abs(endX - startX) > Math.abs(endY - startY) && (endX - startX) > swipeThreshold) {
                                showExitPopup();
                            }
                        }
                        isTouching = false;
                    }, {
                        passive: true
                    });
                }
                // Fast scroll up detection
                var lastScrollTop = window.scrollY;
                var lastScrollTime = Date.now();
                var fastScrollUpThreshold = {
                    deltaY: -100,
                    deltaTime: 200
                };
                window.addEventListener('scroll', function() {
                    var now = Date.now();
                    var currentScrollTop = window.scrollY;
                    var scrollDelta = currentScrollTop - lastScrollTop;
                    var timeDelta = now - lastScrollTime;
                    if (scrollDelta < fastScrollUpThreshold.deltaY && timeDelta < fastScrollUpThreshold.deltaTime) {
                        showExitPopup();
                    }
                    lastScrollTop = currentScrollTop;
                    lastScrollTime = now;
                }, {
                    passive: true
                });
                // Trigger when tab becomes hidden
                window.addEventListener('visibilitychange', function() {
                    if (document.hidden) showExitPopup();
                }, {
                    passive: true
                });
            });

            // Inject styles for the popup variant
            var style = document.createElement('style');
            style.innerHTML = '\n@keyframes pulseBorder {\n  0%   { box-shadow: 0 0 0 0 rgba(255,199,0,.6); }\n  50%  { box-shadow: 0 0 20px 10px rgba(255,199,0,0); }\n  100% { box-shadow: 0 0 0 0 rgba(255,199,0,0); }\n}\n@keyframes pulse {\n  0% { transform: scale(1); }\n  50% { transform: scale(1.1); }\n  100% { transform: scale(1); }\n}\n@keyframes glow {\n  0% { text-shadow: 0 0 5px #FFC700,0 0 10px #FFC700,0 0 20px #FFC700; }\n  50% { text-shadow: 0 0 10px #FFC700,0 0 20px #FFC700,0 0 30px #FFC700; }\n  100% { text-shadow: 0 0 5px #FFC700,0 0 10px #FFC700,0 0 20px #FFC700; }\n}\n\n#popup-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: rgba(0, 0, 0, 0.7);\n  z-index: 99999;\n}\n\n#exit-popup {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%,-50%);\n  background: radial-gradient(circle at center, rgba(0,0,0,.95) 20%, rgba(20,20,20,.98) 100%);\n  color: #fff;\n  padding: 25px;\n  border-radius: 12px;\n  text-align: center;\n  width: 80%;\n  max-width: 450px;\n  border: 2px solid #ffc700;\n  box-shadow: 0 0 25px rgba(255,199,0,.3), 0 0 50px rgba(255,255,255,.1);\n  z-index: 100000;\n  animation: pulseBorder 3s infinite;\n  font-family: \'Inter\', sans-serif;\n}\n\n.close-btn {\n  position: absolute;\n  top: 10px;\n  right: 15px;\n  font: 20px/1 Arial, sans-serif;\n  font-weight: bold;\n  color: #fff;\n  cursor: pointer;\n  transition: .3s;\n}\n.close-btn:hover { transform: scale(1.2); }\n\n.popup-content {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  margin-top: 15px;\n  min-height: 400px;\n}\n.popup-image {\n  width: 100%;\n  max-width: 250px;\n  border-radius: 8px;\n  margin-bottom: 15px;\n}\n.popup-content p {\n  font-size: 19px;\n  margin-bottom: 15px;\n  line-height: 1.4;\n  animation: glow 3s ease-in-out infinite;\n}\n\n.button-container {\n  display: flex;\n  justify-content: center;\n  margin-top: 15px;\n  margin-bottom: 25px;\n}\n\n#claim-btn {\n  background: linear-gradient(#ffc700, #d4af37, #f7e374);\n  color: #1c1c1c;\n  font: 700 1.2rem \'Inter\', sans-serif;\n  text-transform: uppercase;\n  padding: 12px 24px;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: transform .2s, box-shadow .2s;\n  animation: pulse 2.5s infinite;\n  white-space: nowrap;\n}\n#claim-btn:hover {\n  transform: scale(1.05);\n  box-shadow: 0 0 15px rgba(255,199,0,.8);\n}\n\n@media (max-width: 767px) {\n  #claim-btn {\n    font-size: 1rem;\n    padding: 10px 20px;\n    white-space: nowrap;\n  }\n}\n\n.countdown-wrapper {\n  margin-top: auto;\n  margin-bottom: 10px;\n}\n.countdown-container-desktop {\n  text-align: center;\n  color: #FFC700;\n  font-family: \'Inter\', sans-serif;\n  padding: .8rem;\n  margin: auto;\n  max-width: 80%;\n}\n.countdown {\n  display: flex;\n  justify-content: center;\n  gap: 12px;\n}\n.time-box {\n  background: rgba(255,199,0,.07);\n  border: 1px solid rgba(255,199,0,.3);\n  box-shadow: 0 0 10px rgba(255,199,0,.2);\n  border-radius: 8px;\n  width: 60px;\n  height: 60px;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n}\n.countdown-digits {\n  font-size: 1.6rem;\n  font-weight: 700;\n}\n.countdown-label {\n  font-size: .7rem;\n  text-transform: uppercase;\n  margin-top: 2px;\n}\n\n@media (min-width: 768px) {\n  #exit-popup {\n    width: 60%;\n    max-width: 600px;\n    padding: 35px;\n  }\n}\n';
            document.head.appendChild(style);
        }


        function initWheelVariant() {
            // Inject CSS specific to the wheel variant
            var style = document.createElement('style');
            style.textContent = '\n@keyframes pulse {\n  0% { transform: scale(1); }\n  50% { transform: scale(1.1); }\n  100% { transform: scale(1); }\n}\n@keyframes glow {\n  0% { text-shadow: 0 0 5px #FFC700, 0 0 10px #FFC700, 0 0 20px #FFC700; }\n  50% { text-shadow: 0 0 10px #FFC700, 0 0 20px #FFC700, 0 0 30px #FFC700; }\n  100% { text-shadow: 0 0 5px #FFC700, 0 0 10px #FFC700, 0 0 20px #FFC700; }\n}\n.popup button,\nbutton.popup {\n  width: 220px;\n  max-width: 90%;\n  padding: 12px 20px;\n  font-size: 1rem;\n  border-radius: 9px;\n  white-space: nowrap;\n}\n@media (max-width: 767px) {\n  .popup button {\n    width: 350px;\n    max-width: 90%;\n    padding: 12px 20px;\n    font-size: 0.9rem;\n  }\n}\n#exit-modal {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.8);\n  display: none;\n  justify-content: center;\n  align-items: center;\n  z-index: 10000;\n}\n#exit-modal-content {\n  background: rgba(0, 0, 0, 0.9);\n  padding: 20px;\n  border-radius: 10px;\n  position: relative;\n  max-width: 90%;\n  max-height: 90%;\n  overflow: auto;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  border: 3px solid #ffc700;\n}\n#close-modal {\n  position: absolute;\n  top: 10px;\n  right: 15px;\n  background: transparent;\n  color: #fff;\n  font-size: 18px;\n  font-weight: bold;\n  border: none;\n  padding: 0;\n  cursor: pointer;\n  line-height: 1;\n  transition: transform 0.2s ease;\n  z-index: 10002;\n}\n#close-modal:hover {\n  transform: scale(1.2);\n}\n#modal-text {\n  color: #fff;\n  font-size: 1.5rem;\n  font-weight: bold;\n  margin-top: 8px;\n  text-align: center;\n}\n.offer-heading {\n  font-family: \'Inter\', sans-serif;\n  font-size: 1.1rem;\n  font-weight: 700;\n  color: #FFFFFF;\n  margin: 0 0 0.5em;\n  animation: glow 3s ease-in-out infinite;\n}\n.offer-subheading {\n  font-family: \'Inter\', sans-serif;\n  font-size: 1.1rem;\n  font-weight: 700;\n  color: #FFFFFF;\n  margin: 0;\n  animation: glow 3s ease-in-out infinite;\n}\n.offer-subheading s {\n  color: rgba(255, 199, 0, 0.6);\n  text-decoration-color: rgba(255, 199, 0, 0.6);\n  margin-right: 0.3em;\n}\n#win-popup {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: rgba(0, 0, 0, 0.89);\n  color: #fff;\n  display: none;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  text-align: center;\n  padding: 20px;\n  border-radius: 10px;\n  box-sizing: border-box;\n  z-index: 10001;\n}\n.countdown-wrapper {\n  margin-top: 0rem;\n  margin-bottom: 0rem;\n}\n.countdown-container-desktop {\n  text-align: center;\n  color: #FFC700;\n  font-family: \'Inter\', sans-serif;\n  padding: 0.8rem;\n  margin: 0 auto;\n  max-width: 80%;\n  transform: scale(0.75);\n  transform-origin: center;\n}\n.countdown {\n  display: flex;\n  justify-content: center;\n  gap: 12px;\n}\n.time-box {\n  background: rgba(255,199,0,.07);\n  border: 1px solid rgba(255,199,0,.3);\n  box-shadow: 0 0 10px rgba(255,199,0,.2);\n  border-radius: 8px;\n  width: 60px;\n  height: 60px;\n  aspect-ratio: 1 / 1;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n}\n.countdown-digits {\n  font-size: 1.6rem;\n  font-weight: 700;\n}\n.countdown-label {\n  font-size: 0.7rem;\n  text-transform: uppercase;\n  margin-top: 2px;\n}\n';
            document.head.appendChild(style);

            function getNextResetTime() {
                var now = new Date();
                var estOffset = 5 * 60 * 60 * 1000;
                var nowEST = new Date(now.getTime() - estOffset);
                var nextEST = new Date(nowEST);
                nextEST.setHours(6, 0, 0, 0);
                if (nowEST >= nextEST) {
                    nextEST.setDate(nextEST.getDate() + 1);
                }
                return new Date(nextEST.getTime() + estOffset);
            }
            // Start countdown timer to next reset
            function startCountdown() {
                var cutoffTime = new Date('2025-12-30T06:00:00-05:00').getTime();
                var targetTime = getNextResetTime().getTime();
                var countdownInterval = setInterval(function() {
                    var now = Date.now();
                    if (now >= cutoffTime) {
                        clearInterval(countdownInterval);
                        document.querySelectorAll('.countdown-digits').forEach(function(el) {
                            el.innerHTML = '00';
                        });
                        return;
                    }
                    if (now >= targetTime) {
                        targetTime = getNextResetTime().getTime();
                    }
                    var distance = targetTime - now;
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    var update = function(id, val) {
                        var el = document.getElementById(id);
                        if (el) el.innerHTML = val < 10 ? '0' + val : String(val);
                    };
                    update('days-desktop', days);
                    update('hours-desktop', hours);
                    update('minutes-desktop', minutes);
                    update('seconds-desktop', seconds);
                }, 1000);
            }

            document.addEventListener('DOMContentLoaded', function() {
                // Insert the modal HTML structure into the page
                var modalHTML = '\n<div id="exit-modal" role="dialog" aria-labelledby="modal-text">\n  <div id="exit-modal-content">\n    <button id="close-modal" aria-label="Close modal">x</button>\n    <div id="spin-wheel"></div>\n    <div id="modal-text">\n      <p class="offer-heading">Time-Limited Welcome Offer:</p>\n      <p class="offer-subheading">Spin the Wheel and Win up to 150 Free Spins!</p>\n    </div>\n  </div>\n</div>';
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = modalHTML;
                document.body.appendChild(tempDiv.firstElementChild);

                var modal = document.getElementById('exit-modal');
                var modalContent = document.getElementById('exit-modal-content');
                var closeModalBtn = document.getElementById('close-modal');
                var exitIntentShown = sessionStorage.getItem('exitPopupShown') === 'true';
                var lastTrigger = 0;
                var debounceMs = 1000;

                function showExitPopup() {
                    if (!exitIntentShown && Date.now() - lastTrigger > debounceMs) {
                        modal.style.display = 'flex';
                        exitIntentShown = true;
                        sessionStorage.setItem('exitPopupShown', 'true');
                        lastTrigger = Date.now();
                        requestAnimationFrame(animate);
                    }
                }

                var isMobile = function() {
                    return window.innerWidth <= 768;
                };
                // Desktop exit intent
                if (!isMobile()) {
                    document.addEventListener('mouseleave', function(e) {
                        if (e.clientY <= 5) showExitPopup();
                    });
                }
                // Inactivity timer (60s)
                var inactivityTimer;
                var inactivityTimeMs = 60000;
                var resetInactivityTimer = function() {
                    clearTimeout(inactivityTimer);
                    inactivityTimer = setTimeout(showExitPopup, inactivityTimeMs);
                };
                ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(function(evt) {
                    document.addEventListener(evt, resetInactivityTimer, {
                        passive: true
                    });
                });
                resetInactivityTimer();
                // Browser back button
                if (history.pushState) {
                    history.pushState({
                        page: 1
                    }, '', location.href);
                    addEventListener('popstate', function() {
                        showExitPopup();
                        history.pushState({
                            page: 1
                        }, '', location.href);
                    });
                }
                // Swipe detection on mobile
                if (isMobile()) {
                    var startX = 0,
                        startY = 0,
                        isTouching = false;
                    var swipeThreshold = 100;
                    addEventListener('touchstart', function(e) {
                        if (e.touches.length) {
                            isTouching = true;
                            startX = e.touches[0].clientX;
                            startY = e.touches[0].clientY;
                        }
                    }, {
                        passive: true
                    });
                    addEventListener('touchend', function(e) {
                        if (isTouching && e.changedTouches.length) {
                            var endX = e.changedTouches[0].clientX;
                            var endY = e.changedTouches[0].clientY;
                            var horizontalSwipe = Math.abs(endX - startX) > Math.abs(endY - startY);
                            if (horizontalSwipe && (endX - startX) > swipeThreshold) {
                                showExitPopup();
                            }
                        }
                        isTouching = false;
                    }, {
                        passive: true
                    });
                }
                // Visibility change triggers popup
                document.addEventListener('visibilitychange', function() {
                    if (document.hidden) showExitPopup();
                });
                // Fast scroll up detection
                var lastScrollTop = window.scrollY;
                var lastScrollTime = Date.now();
                var fastScrollUpThreshold = {
                    deltaY: -100,
                    deltaTime: 200
                };
                window.addEventListener('scroll', function() {
                    var now = Date.now();
                    var currentScrollTop = window.scrollY;
                    var scrollDelta = currentScrollTop - lastScrollTop;
                    var timeDelta = now - lastScrollTime;
                    if (scrollDelta < fastScrollUpThreshold.deltaY && timeDelta < fastScrollUpThreshold.deltaTime) {
                        showExitPopup();
                    }
                    lastScrollTop = currentScrollTop;
                    lastScrollTime = now;
                }, {
                    passive: true
                });

                // Close the modal on button click
                closeModalBtn.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
                closeModalBtn.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        modal.style.display = 'none';
                    }
                });

                // Extract URL params for redirect building
                var allParams = (window.location.search || '').replace(/^\?/, '');
                var container = document.getElementById('spin-wheel');
                // Prepare container styling
                container.style.position = 'relative';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.alignItems = 'center';
                container.style.justifyContent = 'center';
                container.style.background = 'transparent';
                container.style.color = '#fff';

                // Determine scaling based on device
                var isMobileDevice = isMobile();
                var scaleFactor = isMobileDevice ? 0.9 : 1.4;
                var baseSize = 300;
                var canvasSize = baseSize * scaleFactor;
                container.style.padding = (1 * scaleFactor) + 'px 0';
                var dpr = window.devicePixelRatio || 1;
                // Create canvas for wheel drawing
                var canvas = document.createElement('canvas');
                canvas.width = canvasSize * dpr;
                canvas.height = canvasSize * dpr;
                canvas.style.width = canvasSize + 'px';
                canvas.style.height = canvasSize + 'px';
                canvas.style.borderRadius = '50%';
                canvas.style.boxShadow = '0 0 ' + (15 * scaleFactor) + 'px rgba(255,255,255,0.3)';
                canvas.style.cursor = 'pointer';
                container.appendChild(canvas);
                // Add pointer arrow image
                var arrow = document.createElement('img');
                arrow.src = 'https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/353d89f8-6654-4f6d-aa6e-ff303216f8f0/fewgweg-removebg-preview.small.png';
                arrow.onerror = function() {
                    console.error('Failed to load arrow image');
                };
                arrow.style.position = 'absolute';
                arrow.style.top = (-18 * scaleFactor) + 'px';
                arrow.style.left = '50%';
                arrow.style.transform = 'translateX(-50%)';
                arrow.style.width = (60 * scaleFactor) + 'px';
                arrow.style.height = (60 * scaleFactor) + 'px';
                arrow.style.filter = 'drop-shadow(0 0 ' + (10 * scaleFactor) + 'px #ffc700)';
                container.appendChild(arrow);
                // Insert countdown UI before the wheel text
                var modalTextEl = document.getElementById('modal-text');
                var countdownWrapper = document.createElement('div');
                countdownWrapper.className = 'countdown-wrapper';
                var countdownContainer = document.createElement('div');
                countdownContainer.className = 'countdown-container-desktop';
                var countdownDiv = document.createElement('div');
                countdownDiv.className = 'countdown';
                var createTimeBox = function(id, label) {
                    var box = document.createElement('div');
                    box.className = 'time-box';
                    var digits = document.createElement('span');
                    digits.id = id;
                    digits.className = 'countdown-digits';
                    digits.innerHTML = '00';
                    var lbl = document.createElement('span');
                    lbl.className = 'countdown-label';
                    lbl.innerText = label;
                    box.appendChild(digits);
                    box.appendChild(lbl);
                    return box;
                };
                countdownDiv.appendChild(createTimeBox('days-desktop', 'Days'));
                countdownDiv.appendChild(createTimeBox('hours-desktop', 'Hours'));
                countdownDiv.appendChild(createTimeBox('minutes-desktop', 'Minutes'));
                countdownDiv.appendChild(createTimeBox('seconds-desktop', 'Seconds'));
                countdownContainer.appendChild(countdownDiv);
                countdownWrapper.appendChild(countdownContainer);
                modalContent.insertBefore(countdownWrapper, modalTextEl);
                // Launch countdown
                startCountdown();
                // Add spin button below wheel
                var spinButton = document.createElement('button');
                spinButton.innerText = 'SPIN THE WHEEL';
                spinButton.className = 'popup';
                spinButton.style.backgroundImage = 'linear-gradient(to bottom, #FFEBA5 0%, #FFC700 100%)';
                spinButton.style.color = '#000';
                spinButton.style.border = 'none';
                spinButton.style.cursor = 'pointer';
                spinButton.style.fontWeight = 'bold';
                spinButton.style.marginTop = '20px';
                spinButton.addEventListener('click', spinWheel);
                spinButton.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') spinWheel();
                });
                modalContent.appendChild(spinButton);
                // Define prize slices with images and colours
                var slices = [{
                        gradientColors: ['#ecc440', '#fffa8a', '#ddac17', '#ffff95'],
                        image: 'https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/8036d011-9999-45cd-8835-ea0157b8a9f7/110-preview.small.png',
                        popupMessage: '',
                        popupImage: '',
                        popupTextSize: (17 * scaleFactor) + 'px'
                    },
                    {
                        gradientColors: ['#ab2330', '#d10000', '#800000'],
                        image: 'https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/354bccd9-3d52-47f2-9ac8-9c3891e7144a/150fs.small.png',
                        popupMessage: '',
                        popupImage: 'https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/354bccd9-3d52-47f2-9ac8-9c3891e7144a/150fs.small.png',
                        popupTextSize: (17 * scaleFactor) + 'px'
                    },
                    {
                        gradientColors: ['#ecc440', '#fffa8a', '#ddac17', '#ffff95'],
                        image: 'https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/8036d011-9999-45cd-8835-ea0157b8a9f7/110-preview.small.png',
                        popupMessage: '',
                        popupImage: '',
                        popupTextSize: (17 * scaleFactor) + 'px'
                    },
                    {
                        color: '#000000',
                        image: 'https://user-assets-unbounce-com.s3.amazonaws.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/6cd66bad-ae30-4081-b6a4-95fc28f2d9b7/100fs.small.png',
                        popupMessage: '',
                        popupImage: '',
                        popupTextSize: (20 * scaleFactor) + 'px'
                    },
                    {
                        gradientColors: ['#ecc440', '#fffa8a', '#ddac17', '#ffff95'],
                        image: 'https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/8036d011-9999-45cd-8835-ea0157b8a9f7/110-preview.small.png',
                        popupMessage: '',
                        popupImage: '',
                        popupTextSize: (20 * scaleFactor) + 'px'
                    },
                    {
                        color: '#000000',
                        image: 'https://user-assets-unbounce-com.s3.amazonaws.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/6cd66bad-ae30-4081-b6a4-95fc28f2d9b7/100fs.small.png',
                        popupMessage: '',
                        popupImage: '',
                        popupTextSize: (20 * scaleFactor) + 'px'
                    },
                    {
                        gradientColors: ['#ecc440', '#fffa8a', '#ddac17', '#ffff95'],
                        image: 'https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/8036d011-9999-45cd-8835-ea0157b8a9f7/110-preview.small.png',
                        popupMessage: '',
                        popupImage: '',
                        popupTextSize: (20 * scaleFactor) + 'px'
                    },
                    {
                        color: '#000000',
                        image: 'https://user-assets-unbounce-com.s3.amazonaws.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/6cd66bad-ae30-4081-b6a4-95fc28f2d9b7/100fs.small.png',
                        popupMessage: '',
                        popupImage: '',
                        popupTextSize: (20 * scaleFactor) + 'px'
                    }
                ];
                // Preload images for slices
                slices.forEach(function(slice) {
                    var img = new Image();
                    img.src = slice.image;
                    img.onerror = function() {
                        console.error('Failed to load slice image: ' + slice.image);
                    };
                    slice.imageObj = img;
                });
                // Load logo image
                var logo = new Image();
                logo.src = 'https://user-assets.unbounce.com/bb4a5091-502f-410b-a7f9-963c98fb3b00/b95e4b60-270a-4511-b949-0ec4e06c92e9/blackbutton-removebg-preview.small.png';
                logo.onerror = function() {
                    console.error('Failed to load logo image');
                };
                // Wheel animation variables
                var startAngle = 0;
                var spinning = false;
                var spinResultIndex = 0;
                var studAnimationCounter = 0;
                var studCount = 8;
                var borderRotationAngle = 0;
                var spinStartTime = 0;
                var spinDuration = 6000;
                var initialAngle = 0;
                var finalAngle = 0;
                var borderLineWidth = 19 * scaleFactor;
                var borderRadius = (canvasSize / 2) - (5 * scaleFactor);
                var studDistance = borderRadius - (2 * scaleFactor);
                // Function to draw the entire wheel on canvas
                function drawWheel() {
                    var ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.save();
                    ctx.scale(dpr, dpr);
                    var arc = (Math.PI * 2) / slices.length;
                    for (var i = 0; i < slices.length; i++) {
                        var slice = slices[i];
                        var angle = startAngle + i * arc;
                        var fillStyle = slice.color || '#fff';
                        if (slice.gradientColors) {
                            var g = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
                            slice.gradientColors.forEach(function(c, idx) {
                                g.addColorStop(idx / (slice.gradientColors.length - 1), c);
                            });
                            fillStyle = g;
                        }
                        ctx.save();
                        ctx.shadowColor = 'rgba(0,0,0,0.4)';
                        ctx.shadowBlur = 6 * scaleFactor;
                        ctx.shadowOffsetX = 3 * scaleFactor;
                        ctx.shadowOffsetY = 3 * scaleFactor;
                        ctx.beginPath();
                        ctx.moveTo(canvasSize / 2, canvasSize / 2);
                        ctx.arc(
                            canvasSize / 2,
                            canvasSize / 2,
                            (canvasSize / 2) - (15 * scaleFactor),
                            angle,
                            angle + arc,
                            false
                        );
                        ctx.closePath();
                        ctx.fillStyle = fillStyle;
                        ctx.fill();
                        ctx.lineWidth = 1.5 * scaleFactor;
                        ctx.strokeStyle = '#ffffff';
                        ctx.stroke();
                        ctx.restore();
                        // Draw the prize image on each slice
                        var midAngle = angle + arc / 2;
                        var imgRadius = ((canvasSize / 2) - (17 * scaleFactor)) * 0.75;
                        var imgX = (canvasSize / 2) + imgRadius * Math.cos(midAngle);
                        var imgY = (canvasSize / 2) + imgRadius * Math.sin(midAngle);
                        var imgSize = 60 * scaleFactor;
                        if (slice.imageObj.complete) {
                            ctx.drawImage(
                                slice.imageObj,
                                imgX - imgSize / 2,
                                imgY - imgSize / 2,
                                imgSize,
                                imgSize
                            );
                        }
                    }
                    // Outer border and stud lights
                    ctx.save();
                    ctx.translate(canvasSize / 2, canvasSize / 2);
                    ctx.rotate(borderRotationAngle);
                    var bg = ctx.createLinearGradient(
                        -canvasSize / 2,
                        -canvasSize / 2,
                        canvasSize / 2,
                        canvasSize / 2
                    );
                    ['#F9F295', '#E0AA3E', '#FAF398', '#B88A44', '#F9F295'].forEach(function(c, i) {
                        bg.addColorStop(i / 4, c);
                    });
                    ctx.save();
                    ctx.shadowColor = 'rgba(0,0,0,0.5)';
                    ctx.shadowBlur = 8 * scaleFactor;
                    ctx.shadowOffsetX = 2 * scaleFactor;
                    ctx.shadowOffsetY = 2 * scaleFactor;
                    ctx.beginPath();
                    ctx.arc(0, 0, borderRadius, 0, Math.PI * 2);
                    ctx.lineWidth = borderLineWidth;
                    ctx.strokeStyle = bg;
                    ctx.stroke();
                    ctx.restore();
                    var activeStud = (studCount - (Math.floor(studAnimationCounter) % studCount)) % studCount;
                    var glowCols = ['#ffffff'];
                    var glow = glowCols[Math.floor(studAnimationCounter) % glowCols.length];
                    for (var j = 0; j < studCount; j++) {
                        var a = j * (360 / studCount) * (Math.PI / 180);
                        var x = studDistance * Math.cos(a);
                        var y = studDistance * Math.sin(a);
                        ctx.beginPath();
                        ctx.arc(x, y, 7 * scaleFactor, 0, Math.PI * 2);
                        if (j === activeStud) {
                            ctx.fillStyle = glow;
                            ctx.shadowColor = glow;
                            ctx.shadowBlur = 10 * scaleFactor;
                        } else {
                            ctx.fillStyle = '#FFF';
                            ctx.shadowBlur = 0;
                        }
                        ctx.fill();
                        ctx.closePath();
                    }
                    ctx.restore();
                    // Draw logo at the centre
                    var logoSize = canvasSize * 0.25;
                    ctx.save();
                    ctx.translate(canvasSize / 2, canvasSize / 2);
                    // Subtle pulsing when not spinning
                    if (!spinning) {
                        var tNow = performance.now();
                        var pulse = 1 + 0.05 * Math.sin(tNow * 0.005);
                        ctx.scale(pulse, pulse);
                    }
                    ctx.shadowColor = 'rgba(0,0,0,0.4)';
                    ctx.shadowBlur = 8 * scaleFactor;
                    ctx.shadowOffsetX = 2 * scaleFactor;
                    ctx.shadowOffsetY = 2 * scaleFactor;
                    if (logo.complete) {
                        ctx.drawImage(logo, -logoSize / 2, -logoSize / 2, logoSize, logoSize);
                    }
                    ctx.restore();
                    ctx.restore();
                }
                var animationFrame;

                function animate(ts) {
                    if (modal.style.display === 'none' && !spinning) {
                        cancelAnimationFrame(animationFrame);
                        return;
                    }
                    if (spinning) {
                        var elapsed = ts - spinStartTime;
                        if (elapsed < spinDuration) {
                            var t = elapsed / spinDuration;
                            var eased = 1 - Math.pow(1 - t, 3);
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
                    if (spinning || winPopup.style.display === 'flex') return;
                    spinning = true;
                    spinStartTime = performance.now();
                    var arc = (Math.PI * 2) / slices.length;
                    // For deterministic test you can choose the index; here fixed to index 1 for demonstration
                    spinResultIndex = 1;
                    var baseAngle = -Math.PI / 2 - (spinResultIndex + 0.5) * arc;
                    var currentAngle = startAngle;
                    var needed = (currentAngle + 6 * Math.PI - baseAngle) / (2 * Math.PI);
                    var K = Math.ceil(needed);
                    if (K < 0) K = 0;
                    K += Math.floor(Math.random() * 3);
                    finalAngle = baseAngle + K * 2 * Math.PI;
                    initialAngle = currentAngle;
                    requestAnimationFrame(animate);
                }
                // Create win popup overlay
                var winPopup = document.createElement('div');
                winPopup.id = 'win-popup';
                modalContent.appendChild(winPopup);
                var popupImg = document.createElement('img');
                popupImg.style.width = '100%';
                popupImg.style.maxWidth = (175 * scaleFactor) + 'px';
                popupImg.style.margin = '0 auto ' + (10 * scaleFactor) + 'px';
                winPopup.appendChild(popupImg);
                var winMessage = document.createElement('div');
                winMessage.style.marginBottom = (10 * scaleFactor) + 'px';
                winPopup.appendChild(winMessage);
                var buttonsContainer = document.createElement('div');
                buttonsContainer.style.display = 'flex';
                buttonsContainer.style.justifyContent = 'center';
                buttonsContainer.style.alignItems = 'center';
                buttonsContainer.style.flexWrap = 'wrap';
                buttonsContainer.style.gap = (20 * scaleFactor) + 'px';
                winPopup.appendChild(buttonsContainer);
                // Define redirect URLs; index 1 corresponds to winning 150 spins
                var redirectUrls = {
                    default: 'https://betty.ca/register?utm_campaign=pop_up_150_wheel&' + allParams
                };

                function getRedirectUrl(idx) {
                    return redirectUrls[idx] || redirectUrls.default;
                }

                function showCongratulationsPopup(idx) {
                    var s = slices[idx];
                    buttonsContainer.innerHTML = '';
                    buttonsContainer.style.marginTop = (30 * scaleFactor) + 'px';
                    if (idx === 1) {
                        winMessage.innerHTML = '\n  <p class="offer-heading">You’ve won 150 Free Spins!</p>\n  <p class="offer-subheading">Use them on a game of your choice!</p>\n';
                        popupImg.src = s.popupImage;
                    } else if (idx === 3 || idx === 5) {
                        winMessage.innerHTML = '';
                        winMessage.style.fontSize = (17 * scaleFactor) + 'px';
                        popupImg.src = slices[3].popupImage;
                    } else {
                        winMessage.innerText = s.popupMessage;
                        winMessage.style.fontSize = s.popupTextSize;
                        popupImg.src = s.popupImage;
                    }
                    var redirectUrl = getRedirectUrl(idx);
                    if (idx === 3 || idx === 5) {
                        buttonsContainer.style.flexDirection = 'column';
                        var claimBtn = document.createElement('button');
                        claimBtn.innerText = 'Claim Your Reward';
                        claimBtn.className = 'popup';
                        claimBtn.style.backgroundImage = 'linear-gradient(to bottom, #FFEBA5 0%, #FFC700 100%)';
                        claimBtn.style.color = '#000';
                        claimBtn.style.border = 'none';
                        claimBtn.style.cursor = 'pointer';
                        claimBtn.style.fontWeight = 'bold';
                        claimBtn.style.animation = 'pulse 1s infinite';
                        claimBtn.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = redirectUrl;
                        });
                        claimBtn.addEventListener('touchend', claimBtn.onclick);
                        buttonsContainer.appendChild(claimBtn);
                        var againBtn = document.createElement('button');
                        againBtn.innerText = 'Spin One More Time';
                        againBtn.className = 'popup';
                        againBtn.style.background = '#fff';
                        againBtn.style.color = '#000';
                        againBtn.style.border = 'none';
                        againBtn.style.cursor = 'pointer';
                        againBtn.style.fontWeight = 'bold';
                        againBtn.addEventListener('click', function() {
                            winPopup.style.display = 'none';
                            spinWheel();
                        });
                        buttonsContainer.appendChild(againBtn);
                    } else {
                        var claimBtn2 = document.createElement('button');
                        claimBtn2.innerText = 'Get Your Bonus Now';
                        claimBtn2.className = 'popup';
                        claimBtn2.style.backgroundImage = 'linear-gradient(to bottom, #FFEBA5 0%, #FFC700 100%)';
                        claimBtn2.style.color = '#000';
                        claimBtn2.style.border = 'none';
                        claimBtn2.style.cursor = 'pointer';
                        claimBtn2.style.fontWeight = 'bold';
                        claimBtn2.style.animation = 'pulse 1s infinite';
                        claimBtn2.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = redirectUrl;
                        });
                        claimBtn2.addEventListener('touchend', claimBtn2.onclick);
                        buttonsContainer.appendChild(claimBtn2);
                    }
                    winPopup.style.display = 'flex';
                }
                canvas.addEventListener('click', spinWheel);
                logo.onload = function() {
                    if (modal.style.display !== 'none' || spinning) {
                        requestAnimationFrame(animate);
                    }
                };
            });
        }

        // Initialise the appropriate variant
        if (abVariant === 'popup') {
            initPopupVariant();
        } else {
            initWheelVariant();
        }
    })();
