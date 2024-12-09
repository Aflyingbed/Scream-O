const muteCheck = document.getElementById("muteCheck");

function playSoundEffect() {
  if (muteCheck.checked) return;
  
  // Create and play a new audio instance immediately
  new Audio("../sfx/ripple.wav").play();
}

function addRippleEffect(screamElement) {
  const ripple = document.createElement("div");
  ripple.classList.add("absolute", "bg-red-900", "rounded-full");
  const rect = screamElement.getBoundingClientRect();
  const rippleSize = Math.min(rect.width, rect.height);

  Object.assign(ripple.style, {
    width: `${rippleSize}px`,
    height: `${rippleSize}px`,
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    animation: "ripple-animation 0.6s linear",
  });

  screamElement.appendChild(ripple);
  ripple.addEventListener("animationend", () => {
    ripple.remove();
  });
}

function triggerShakeEffect(element, message) {
    element.classList.add("shake");
    element.value = "";
    element.setAttribute("placeholder", message);
  
    setTimeout(() => {
      element.classList.remove("shake");
      element.setAttribute("placeholder", "SCREAM");
    }, 500);
  }

export { addRippleEffect, triggerShakeEffect, playSoundEffect };
