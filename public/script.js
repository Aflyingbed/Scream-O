const ws = new WebSocket("ws://localhost:8000/screamo");
const muteCheck = document.getElementById("muteCheck");
const newScreamSound = new Audio("./sfx/ripple.wav");

function playSoundEffect() {
  if (!muteCheck.checked) {
    newScreamSound.currentTime = 0;
    newScreamSound.play();
  }
}

const screamsContainer = document.getElementById("screamsContainer");
const screamForm = document.getElementById("screamForm");
const MAX_SCREAMS = 15;
const SCREAM_FADEOUT_DURATION = 1500;
const RANDOM_ROTATION_RANGE = 20;
const RANDOM_SIZE_RANGE = { min: 1, max: 6 };

function getRandomNumberInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomizeScream(screamElement) {
  const containerWidth = screamsContainer.clientWidth;
  const containerHeight = screamsContainer.clientHeight;
  const randomX = getRandomNumberInRange(0, containerWidth - 200);
  const randomY = getRandomNumberInRange(0, containerHeight - 100);
  const randomSize = `${getRandomNumberInRange(
    RANDOM_SIZE_RANGE.min,
    RANDOM_SIZE_RANGE.max
  ).toFixed(1)}rem`;
  const randomRotation = `${getRandomNumberInRange(
    -RANDOM_ROTATION_RANGE,
    RANDOM_ROTATION_RANGE
  ).toFixed(1)}deg`;

  Object.assign(screamElement.style, {
    position: "absolute",
    left: `${randomX}px`,
    top: `${randomY}px`,
    fontSize: randomSize,
    transform: `rotate(${randomRotation})`,
    transition: "all 2s ease-out",
  });
}

function fadeOutScream(screamElement) {
  screamElement.style.opacity = "0";
  screamElement.style.transform = "scale(0.5)";
  setTimeout(() => {
    screamElement.remove();
  }, SCREAM_FADEOUT_DURATION);
}

function displayScream(screamText) {
  while (screamsContainer.children.length >= MAX_SCREAMS) {
    screamsContainer.removeChild(screamsContainer.firstChild);
  }

  const screamElement = document.createElement("div");
  screamElement.textContent = screamText;
  screamElement.classList.add(
    "absolute",
    "text-red-500",
    "font-bold",
    "ease-out",
    "uppercase"
  );

  randomizeScream(screamElement);
  screamsContainer.appendChild(screamElement);
  addRippleEffect(screamElement);
  playSoundEffect();
  setTimeout(() => fadeOutScream(screamElement), SCREAM_FADEOUT_DURATION);
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
  element.setAttribute("placeholder", message);

  setTimeout(() => {
    element.classList.remove("shake");
    element.setAttribute("placeholder", "SCREAM");
  }, 500);
}

function handleFormSubmit(e) {
  e.preventDefault();
  const inputValue = screamInput.value.trim();

  if (!inputValue) {
    triggerShakeEffect(screamInput, "Input cannot be empty!");
    return;
  }

  if (inputValue.length > 30) {
    triggerShakeEffect(screamInput, "Input cannot exceed 30 characters!");
    return;
  }

  ws.send(
    JSON.stringify({
      type: "screams",
      scream: inputValue,
    })
  );

  const keepText = document.getElementById("keepText").checked;
  if (!keepText) {
    screamInput.value = "";
  }
}

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.type === "screamForClient") {
      const latestScream = data.screams[data.screams.length - 1];
      latestScream && displayScream(latestScream);
    }
  } catch (error) {
    console.error("Failed to process WebSocket message:", error);
  }
};

screamForm.addEventListener("submit", handleFormSubmit);
