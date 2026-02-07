import { triggerShakeEffect, playSoundEffect } from "./effects.js";
import { displayScream, simulateScream } from "./scream.js";

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(`${protocol}//${window.location.host}/screamo`);

const elements = {
  screamsContainer: document.getElementById("screamsContainer"),
  screamForm: document.getElementById("screamForm"),
  screamInput: document.getElementById("screamInput"),
  keepText: document.getElementById("keepText"),
  simulateButton: document.getElementById("simulateButton"),
};

function handleFormSubmit(e) {
  e.preventDefault();
  const inputValue = elements.screamInput.value.trim();

  if (!inputValue) {
    triggerShakeEffect(elements.screamInput, "Input cannot be empty!");
    return;
  }

  if (inputValue.length > 30) {
    triggerShakeEffect(
      elements.screamInput,
      "Input cannot exceed 30 characters!"
    );
    return;
  }

  ws.send(
    JSON.stringify({
      type: "screams",
      scream: inputValue,
    })
  );

  if (!elements.keepText.checked) {
    elements.screamInput.value = "";
  }
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "screamForClient") {
    const latestScream = data.screams[data.screams.length - 1];
    if (latestScream) {
      displayScream(latestScream, elements.screamsContainer);
      playSoundEffect();
    }
  }
};

elements.screamForm.addEventListener("submit", handleFormSubmit);
elements.simulateButton.addEventListener("click", () => simulateScream(ws));
