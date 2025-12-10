//notification
function showNotification(message, type = "success", duration = 3000) {
  const bar = document.getElementById("notificationBar");
  bar.textContent = message;
  bar.className = "notification-bar show " + type;

  setTimeout(() => {
    bar.className = "notification-bar";
  }, duration);
}

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

async function checkAuth() {
  try {
    const response = await fetch("http://localhost:3100/bloodbank/verify", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      const nameElement = document.getElementById("bloodBankName");
      nameElement.textContent = data.user.Bloodbank;

      const bloodBankInput = document.getElementById("bloodBankinput");
      if (bloodBankInput) bloodBankInput.value = data.user.Bloodbank;
    } else {
      setTimeout(() => {
        window.location.href = "auth.html";
      }, 500);
    }
  } catch (err) {
    console.error("Error verifying token:", err);
    setTimeout(() => {
      window.location.href = "auth.html";
    }, 500);
  }
}

window.addEventListener("DOMContentLoaded", checkAuth);

//donation record form
document
  .getElementById("addDonationForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const donorName = document.getElementById("donorName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const bloodType = document.getElementById("bloodType").value;
    const date = document.getElementById("donationDate").value;
    const units = document.getElementById("units").value;
    const bloodBankName = document
      .getElementById("bloodBankinput")
      .value.trim();

    try {
      const response = await fetch("http://localhost:3100/donation/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donorName,
          email,
          phoneNumber,
          bloodType,
          date,
          units,
          bloodBankName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(data.message);
        this.reset();
      } else {
        showNotification(data.message, "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Server error. Please try again.", "error");
    }
  });

// Load appointments from backend
async function loadAppointments() {
  try {
    const response = await fetch(
      "http://localhost:3100/bloodbank/services/getappointment",
      {
        method: "GET",
        credentials: "include", // send cookies
      }
    );

    const data = await response.json();
    const tbody = document.getElementById("appointmentsTableBody");
    tbody.innerHTML = "";

    if (response.ok && data.success && data.appointments.length > 0) {
      data.appointments.forEach((appt) => {
        const row = document.createElement("tr");
        const date = new Date(appt.preferredDate).toLocaleDateString();
        const time = appt.preferredTime;
        const donorName = `${appt.firstName} ${appt.lastName}`;
        const email = appt.email;
        const phone = appt.phone;
        const bloodType = appt.bloodType || "-";
        const message = appt.message || "-";
        const firstTimeDonor = appt.firstTimeDonor ? "Yes" : "No";

        row.innerHTML = `
          <td>${date}</td>
          <td>${time}</td>
          <td>${donorName}</td>
          <td>${email}</td>
          <td>${phone}</td>
          <td>${bloodType}</td>
          <td>${message}</td>
          <td>${firstTimeDonor}</td>
        `;
        tbody.appendChild(row);
      });
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;">No appointments found</td>
        </tr>
      `;
    }
  } catch (err) {
    console.error(err);
    const tbody = document.getElementById("appointmentsTableBody");
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;">Failed to load appointments</td>
      </tr>
    `;
  }
}

// Call the function when dashboard loads
window.addEventListener("DOMContentLoaded", loadAppointments);

// Fetch and display recent donations (last 7 days)
async function loadRecentDonations() {
  try {
    const response = await fetch(
      "http://localhost:3100/bloodbank/services/getdonation",
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();
    const tableBody = document.getElementById("donationRecordsTableBody");
    tableBody.innerHTML = "";

    if (response.ok && data.success) {
      if (data.donations.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center;">No donations in the last 7 days</td>
          </tr>
        `;
        return;
      }

      data.donations.forEach((donation) => {
        const row = document.createElement("tr");
        const donationDate = new Date(donation.date).toLocaleDateString();

        row.innerHTML = `
          <td>${donationDate}</td>
          <td>${donation.donorName}</td>
          <td>${donation.phoneNumber}</td>
          <td>${donation.bloodType}</td>
          <td>${donation.units}</td>
          <td>${donation.status || "Completed"}</td>
        `;

        tableBody.appendChild(row);
      });
    } else {
      showNotification(
        data.message || "Failed to load recent donations",
        "error"
      );
    }
  } catch (err) {
    console.error(err);
    showNotification("Server error while loading recent donations", "error");
  }
}

// Call the function when page loads
window.addEventListener("DOMContentLoaded", loadRecentDonations);

// Logout button
document
  .getElementById("logoutLink")
  .addEventListener("click", async function (e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3100/bloodbank/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(data.message, "success");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        showNotification(data.message, "error");
      }
    } catch (err) {
      console.error(err);
      showNotification(data.message, "error");
    }
  });
