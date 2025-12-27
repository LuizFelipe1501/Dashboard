function startMonitoring() {
  document.getElementById("systemStatus").innerText = "MONITORING";
  document.getElementById("systemStatus").className = "status active";

  document.getElementById("cameraStatus").innerText = "ON";
  document.getElementById("micStatus").innerText = "LISTENING";
  document.getElementById("aiStatus").innerText = "ACTIVE";

  setAlert("System is actively monitoring the environment.", false);
}

function simulateAlert() {
  setAlert(
    "Potential hallucination detected based on visual and audio context mismatch.",
    true
  );
}

function activateVoice() {
  setAlert(
    "Halu is speaking to the user with calm and grounding guidance.",
    false
  );
}

function askEmergency() {
  const decision = confirm(
    "Potential high-risk situation detected.\n\nDo you want to contact emergency services?"
  );

  if (decision) {
    setAlert(
      "Emergency action confirmed by the user. (Action simulated for safety.)",
      true
    );
  } else {
    setAlert(
      "User declined emergency contact. Monitoring continues.",
      false
    );
  }
}

function setAlert(message, critical) {
  const alertBox = document.getElementById("alertBox");
  const alertText = document.getElementById("alertText");

  alertText.innerText = message;

  if (critical) {
    alertBox.classList.add("active");
  } else {
    alertBox.classList.remove("active");
  }
}
