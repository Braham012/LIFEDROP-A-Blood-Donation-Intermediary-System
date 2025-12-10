async function loadDonorName() {
  try {
    const response = await fetch("http://localhost:3100/donor/verify", {
      method: "GET",
      credentials: "include", // send cookies
    });

    const data = await response.json();

    if (data.success) {
      const nameElement = document.getElementById("userName");
      nameElement.textContent = data.user.name; // set donor name dynamically
    } else {
      // If not authenticated, redirect to login
      setTimeout(() => {
        window.location.href = "auth.html"; // or your login page
      }, 500);
    }
  } catch (err) {
    console.error("Error fetching donor name:", err);
    setTimeout(() => {
      window.location.href = "auth.html";
    }, 500);
  }
}

// Call it on page load
document.addEventListener("DOMContentLoaded", loadDonorName);

function showNotification(message, type = "success", duration = 3000) {
  const bar = document.getElementById("notificationBar");
  bar.textContent = message;
  bar.className = "notification-bar show " + type;

  setTimeout(() => {
    bar.className = "notification-bar";
  }, duration);
}

let allBloodData = [];

// Populate locations
function populatePreferredLocations() {
  const locationSelect = document.getElementById("location");
  if (!locationSelect) return;
  locationSelect.innerHTML = '<option value="">Select location</option>';
  allBloodData.forEach((b) => {
    const option = document.createElement("option");
    option.value = b._id;
    option.textContent = b.bloodbankname || b.name;
    locationSelect.appendChild(option);
  });
}

async function fetchAllBloodbanks() {
  try {
    const res = await fetch(
      "http://localhost:3100/donor/services/getallbloodbank"
    );
    const json = await res.json();
    allBloodData = Array.isArray(json?.data) ? json.data : [];
    populatePreferredLocations();
  } catch (err) {
    console.error("Failed to fetch bloodbanks", err);
  }
}

document.addEventListener("DOMContentLoaded", fetchAllBloodbanks);

// Sidebar navigation
const links = document.querySelectorAll(".sidebar a");
const sections = document.querySelectorAll(".section");

links.forEach((link) => {
  link.addEventListener("click", function (e) {
    if (this.id === "emergencyLink") {
      e.preventDefault();
      const url = this.getAttribute("href");
      setTimeout(() => {
        window.open(url, "_blank");
      }, 400);
      return;
    }

    e.preventDefault();
    const targetId = this.getAttribute("href").substring(1);
    const targetSection =
      document.getElementById(targetId + "Section") ||
      document.getElementById(targetId);

    sections.forEach((section) => section.classList.remove("active"));
    if (targetSection) targetSection.classList.add("active");

    links.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
  });
});
async function loadDonationRecords() {
  try {
    const res = await fetch("http://localhost:3100/donor/services/records", {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    const tbody = document.getElementById("donationRecordsTableBody");
    tbody.innerHTML = "";

    if (
      res.ok &&
      data.success &&
      Array.isArray(data.records) &&
      data.records.length > 0
    ) {
      data.records.forEach((record) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(record.date).toLocaleDateString()}</td>
          <td>${record.bloodBankName || "-"}</td>
          <td>${record.bloodType || "-"}</td>
          <td>${record.status || "Completed"}</td>
        `;
        tbody.appendChild(row);
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No donation records found</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    const tbody = document.getElementById("donationRecordsTableBody");
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Failed to load donation records</td></tr>`;
  }
}

// Load donation records when page loads
document.addEventListener("DOMContentLoaded", loadDonationRecords);

async function loadBloodbankData() {
  try {
    const res = await fetch(
      "http://localhost:3100/donor/services/getallbloodbank"
    );
    const data = await res.json();
    const tbody = document.getElementById("bloodbankTableBody");
    tbody.innerHTML = "";

    if (res.ok && Array.isArray(data.data) && data.data.length > 0) {
      data.data.forEach((b) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${b.bloodbankname || "-"}</td>
          <td>${b.address || "-"}</td>
          <td>${b.phonenumber || "-"}</td>
          <td>${b.email || "-"}</td>
        `;
        tbody.appendChild(row);
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No blood banks found</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    const tbody = document.getElementById("bloodbankTableBody");
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Failed to load blood banks</td></tr>`;
  }
}

// Load blood bank data when page loads
document.addEventListener("DOMContentLoaded", loadBloodbankData);

document
  .getElementById("donationForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      bloodType: document.getElementById("bloodType").value,
      preferredDate: document.getElementById("preferredDate").value,
      preferredTime: document.getElementById("preferredTime").value,
      location: document.getElementById("location").value,
      message: document.getElementById("message").value.trim(),
      firstTimeDonor: document.getElementById("firstTime").checked,
    };

    if (!formData.location) {
      showNotification("Please select a location.", "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:3100/appointment/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        showNotification("Appointment scheduled successfully!", "success");
        this.reset();
      } else {
        showNotification("Failed to schedule: " + data.message, "error");
      }
    } catch (err) {
      console.error(err);
      showNotification(
        "Error scheduling appointment. Please try again.",
        "error"
      );
    }
  });

document
  .getElementById("logoutLink")
  .addEventListener("click", async function (e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3100/donor/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        showNotification(data.message);

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        showNotification(data.message);
      }
    } catch (err) {
      console.error(err);
      showNotification("Error during logout. Please try again.");
    }
  });
