import { addRippleEffect } from './effects.js';

const MAX_SCREAMS = 15;
const SCREAM_FADEOUT_DURATION = 1500;
const RANDOM_ROTATION_RANGE = 20;
const RANDOM_SIZE_RANGE = { min: 1, max: 6 };

const SIMULATION_SCREAMS = [
  "AHHH!", "EEEEK!", "OOOOF!", "YIKES!", "WOAH!", "AAAAA!", "EEEEE!"
];

function getRandomNumberInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomizeScream(screamElement, screamsContainer) {
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

function displayScream(screamText, screamsContainer) {
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

  randomizeScream(screamElement, screamsContainer);
  screamsContainer.appendChild(screamElement);
  addRippleEffect(screamElement);
  setTimeout(() => fadeOutScream(screamElement), SCREAM_FADEOUT_DURATION);
}

function getRandomScream() {
  return SIMULATION_SCREAMS[Math.floor(Math.random() * SIMULATION_SCREAMS.length)];
}

function simulateScream(ws) {
  const intensity = document.getElementById("intensitySlider").value;
  const loopDuration = document.getElementById("loopSlider").value;
  const startTime = Date.now();

  function sendSimulatedScream() {
    ws.send(JSON.stringify({
      type: "screams",
      scream: getRandomScream(),
    }));
  }

  // Initial burst of screams based on intensity
  for (let i = 0; i < intensity; i++) {
    setTimeout(sendSimulatedScream, i * 100);
  }

  // If loop duration is set, continue sending screams
  if (loopDuration > 0) {
    const intervalId = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      if (elapsedTime >= loopDuration) {
        clearInterval(intervalId);
        return;
      }
      sendSimulatedScream();
    }, 1000 / intensity);
  }
}

export { displayScream, simulateScream }; 