const form = document.getElementById("emergencyForm");
const notification = document.getElementById("notification");
const notificationText = document.getElementById("notificationText");

function showNotification(message, type = "success") {
  notificationText.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "flex";

  setTimeout(() => {
    notification.style.display = "none";
  }, 4000);
}

function validateForm() {
  const requiredFields = form.querySelectorAll("[required]");
  let isValid = true;

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      field.style.borderColor = "var(--error-color)";
      isValid = false;
    } else {
      field.style.borderColor = "var(--border-color)";
    }
  });

  const email = document.getElementById("email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.value && !emailRegex.test(email.value)) {
    email.style.borderColor = "var(--error-color)";
    isValid = false;
  }

  const contact = document.getElementById("contact");
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  if (contact.value && !phoneRegex.test(contact.value)) {
    contact.style.borderColor = "var(--error-color)";
    isValid = false;
  }

  const age = document.getElementById("age");
  if (age.value && (age.value < 1 || age.value > 120)) {
    age.style.borderColor = "var(--error-color)";
    isValid = false;
  }

  return isValid;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    showNotification("Please fill in all required fields correctly.", "error");
    return;
  }

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch("http://localhost:3100/emergency/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      showNotification(result.message);

      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);

      form.reset();
    } else {
      showNotification(result.message);
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification("Failed to submit request. Try again.", "error");
  }
});

// Real-time validation
form.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("blur", () => {
    if (field.hasAttribute("required") && !field.value.trim()) {
      field.style.borderColor = "var(--error-color)";
    } else {
      field.style.borderColor = "var(--border-color)";
    }
  });

  field.addEventListener("input", () => {
    if (field.value.trim()) {
      field.style.borderColor = "var(--border-color)";
    }
  });
});
// OPEN MAP WHEN CLICKING LOCATION INPUT
const locationInput = document.getElementById("location");
locationInput.addEventListener("click", () => {
  openMap();
});

let map,
  marker,
  selectedCoords = null;

function openMap() {
  document.getElementById("mapModal").style.display = "flex";

  // Initialize map only once
  if (!map) {
    map = L.map("map").setView([31.592574, 75.662842], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    map.on("click", function (e) {
      if (marker) map.removeLayer(marker);
      marker = L.marker(e.latlng).addTo(map);
      selectedCoords = e.latlng;
    });
  }
}

function closeMap() {
  document.getElementById("mapModal").style.display = "none";
}

function confirmLocation() {
  if (!selectedCoords) {
    alert("Please select a location on the map.");
    return;
  }

  locationInput.value = `${selectedCoords.lat.toFixed(
    6
  )}, ${selectedCoords.lng.toFixed(6)}`;
  closeMap();
}
