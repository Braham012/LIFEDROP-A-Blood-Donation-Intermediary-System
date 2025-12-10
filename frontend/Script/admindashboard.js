async function verifyAdmin() {
  try {
    const res = await fetch("http://localhost:3100/admin/verify", {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    if (!data.success) {
      setTimeout(() => {
        window.location.href = "auth.html";
      }, 500);
      return;
    }

    console.log("Admin verified:", data.user);
  } catch (error) {
    console.log("Auth error:", error);
    setTimeout(() => {
      window.location.href = "auth.html";
    }, 500);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  verifyAdmin();
  fetchDashboardStats();
});

function showNotification(msg) {
  const note = document.getElementById("notification");
  note.textContent = msg;
  note.style.display = "block";
  setTimeout(() => (note.style.display = "none"), 3000);
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function deriveCount(resp) {
  if (!resp) return 0;
  if (Array.isArray(resp)) return resp.length;
  if (Array.isArray(resp?.data)) return resp.data.length;
  if (typeof resp.count === "number") return resp.count;
  return 0;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ========== Global Variables ========== */
let allBloodData = [];
let allDonorData = [];

/* ========== Navigation Handling ========== */
function showSection(id, e) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));
  if (e) e.target.classList.add("active");

  if (id === "dashboard") fetchDashboardStats();
  if (id === "all-bloodbank") fetchAllBloodbanks();
  if (id === "pending-approval") fetchPendingBloodbanks();
  if (id === "all-donors") fetchAllDonors();
  if (id === "emergency-requests") fetchEmergencyRequests();
  if (id === "feedback-forms") fetchFeedbackForms();
}

/* ========== Dashboard Fetch ========== */
async function fetchDashboardStats() {
  const endpoints = [
    {
      url: "http://localhost:3100/admin/services/getallbloodbank",
      id: "bloodbankCount",
    },
    {
      url: "http://localhost:3100/admin/services/getallpendingbloodbank",
      id: "pendingCount",
    },
    {
      url: "http://localhost:3100/admin/services/getallemergencyrequest",
      id: "emergencyCount",
    },
  ];

  const results = await Promise.allSettled(endpoints.map((e) => fetch(e.url)));

  for (let i = 0; i < endpoints.length; i++) {
    const data =
      results[i].status === "fulfilled"
        ? await safeJson(results[i].value)
        : null;
    document.getElementById(endpoints[i].id).textContent = deriveCount(data);
  }
}

/* ========== Donors Section ========== */
async function fetchAllDonors() {
  const tbody = document.getElementById("donorTable");
  tbody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

  try {
    const res = await fetch("http://localhost:3100/admin/services/getalldonor");
    const json = await safeJson(res);
    allDonorData = Array.isArray(json?.donors) ? json.donors : [];
    renderDonors(allDonorData);
    showNotification("Donors loaded successfully");
  } catch {
    tbody.innerHTML = `<tr><td colspan="6">Error loading donors</td></tr>`;
    showNotification("Failed to load donors");
  }
}

function renderDonors(list) {
  const tbody = document.getElementById("donorTable");
  tbody.innerHTML = list.length
    ? list
        .map(
          (d, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${escapeHtml(d.name)}</td>
                  <td>${escapeHtml(d.email)}</td>
                  <td>${escapeHtml(d.phonenumber)}</td>
                  <td>${escapeHtml(d.bloodgroup)}</td>
                </tr>`
        )
        .join("")
    : `<tr><td colspan="6">No donors found</td></tr>`;
}

function searchDonors() {
  const q = document.getElementById("searchDonors").value.toLowerCase();
  const filtered = allDonorData.filter((d) =>
    [d.name, d.email, d.bloodgroup, d.phonenumber, d.city]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
  renderDonors(filtered);
}

/* ========== Bloodbank Section ========== */
async function fetchAllBloodbanks() {
  const tbody = document.getElementById("allBloodTable");
  tbody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

  try {
    const res = await fetch(
      "http://localhost:3100/admin/services/getallbloodbank"
    );
    const json = await safeJson(res);
    allBloodData = Array.isArray(json?.data) ? json.data : [];
    renderBloodbanks(allBloodData);
    showNotification("Bloodbanks loaded successfully");
  } catch {
    tbody.innerHTML = `<tr><td colspan="6">Error loading data</td></tr>`;
    showNotification("Failed to load bloodbanks");
  }
}

function renderBloodbanks(list) {
  const tbody = document.getElementById("allBloodTable");
  tbody.innerHTML = list.length
    ? list
        .map(
          (b, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${escapeHtml(b.bloodbankname || b.name || "-")}</td>
                  <td>${escapeHtml(b.registrationid || "-")}</td>
                  <td>${escapeHtml(b.email || "-")}</td>
                  <td>${escapeHtml(b.phonenumber || "-")}</td>
                  <td><span class="status active">Approved</span></td>
                </tr>`
        )
        .join("")
    : `<tr><td colspan="6">No bloodbanks found</td></tr>`;
}

function searchBloodbanks() {
  const q = document.getElementById("searchAll").value.toLowerCase();
  renderBloodbanks(
    allBloodData.filter((b) =>
      [b.bloodbankname, b.registrationid, b.email, b.phonenumber]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  );
}

/* ========== PENDING BLOODBANKS WITH POPUP ========== */
let pendingBloodbanks = [];

async function fetchPendingBloodbanks() {
  const tbody = document.getElementById("pendingTable");
  tbody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

  try {
    const res = await fetch(
      "http://localhost:3100/admin/services/getallpendingbloodbank"
    );
    const json = await res.json();
    pendingBloodbanks = Array.isArray(json?.data) ? json.data : [];

    renderPendingBloodbanks(pendingBloodbanks);
    showNotification("Pending approvals loaded");
  } catch {
    tbody.innerHTML = `<tr><td colspan="7">Error loading data</td></tr>`;
    showNotification("Failed to load pending approvals");
  }
}

function renderPendingBloodbanks(list) {
  const tbody = document.getElementById("pendingTable");
  tbody.innerHTML = list.length
    ? list
        .map(
          (b, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(b.bloodbankname || "-")}</td>
        <td>${escapeHtml(b.registrationid || "-")}</td>
        <td>${escapeHtml(b.email || "-")}</td>
        <td>${escapeHtml(b.phonenumber || "-")}</td>
        <td><span class="status pending">Pending</span></td>
        <td><a href="#" class="viewRequest" data-index="${i}">View Request</a></td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="7">No pending bloodbanks</td></tr>`;

  // Attach click events to "View Request"
  document.querySelectorAll(".viewRequest").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const index = link.dataset.index;
      openModal(list[index]);
    });
  });
}

function openModal(bloodbank) {
  const modal = document.getElementById("actionModal");
  const content = document.getElementById("modalContent");
  content.innerHTML = `
    <p><strong>Name:</strong> ${escapeHtml(bloodbank.bloodbankname)}</p>
    <p><strong>Registration ID:</strong> ${escapeHtml(
      bloodbank.registrationid
    )}</p>
    <p><strong>Email:</strong> ${escapeHtml(bloodbank.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(bloodbank.phonenumber)}</p>
    <p><strong>Address:</strong> ${escapeHtml(bloodbank.address)}</p>
    <p><strong>Map Location:</strong> ${escapeHtml(bloodbank.maplocation)}</p>
  `;
  document.getElementById("remarkInput").value = "";
  modal.style.display = "flex";

  document.getElementById("acceptBtn").onclick = () =>
    handleAction(bloodbank, "accepted");
  document.getElementById("rejectBtn").onclick = () =>
    handleAction(bloodbank, "rejected");
}

// Close modal
document.getElementById("closeModal").onclick = () => {
  document.getElementById("actionModal").style.display = "none";
};

function handleAction(bloodbank, action) {
  const remark = document.getElementById("remarkInput").value;

  fetch(
    `http://localhost:3100/admin/services/pendingbloodbank/${bloodbank._id}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, remark }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      showNotification(data.message || "Action submitted");
      document.getElementById("actionModal").style.display = "none";
      fetchPendingBloodbanks(); // refresh table
    })
    .catch(() => showNotification("Failed to submit action"));
}

//emergency section
async function fetchEmergencyRequests() {
  const tbody = document.getElementById("emergencyTable");
  tbody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

  try {
    const res = await fetch(
      "http://localhost:3100/admin/services/getallemergencyrequest"
    );

    const json = await safeJson(res);
    const list = Array.isArray(json?.data) ? json.data : [];

    tbody.innerHTML = list.length
      ? list
          .map(
            (req, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(req.name || "-")}</td>
        <td>${escapeHtml(req.bloodgroup || "-")}</td>
        <td>${escapeHtml(req.needwithin || "-")}</td>
        <td>${escapeHtml(req.address || "-")}</td>
        <td>${escapeHtml(req.contact || "-")}</td>
        <td>${escapeHtml(new Date(req.createdAt).toLocaleString())}</td>
      </tr>`
          )
          .join("")
      : `<tr><td colspan="7">No emergency requests found</td></tr>`;

    showNotification("Emergency requests loaded");
  } catch {
    tbody.innerHTML = `<tr><td colspan="7">Error loading emergency requests</td></tr>`;
    showNotification("Failed to load emergency requests");
  }
}

/* ========== Logout Function ========== */
async function logout() {
  try {
    const response = await fetch("http://localhost:3100/admin/logout", {
      method: "POST",
      credentials: "include",
    });

    const result = await safeJson(response);

    if (response.ok && result?.message) {
      showNotification(result.message);
      setTimeout(() => (window.location.href = "index.html"), 1000);
    } else {
      showNotification(result?.message || "Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
    showNotification("Something went wrong while logging out.");
  }
}

let allFeedbackData = [];

async function fetchFeedbackForms() {
  const tbody = document.getElementById("feedbackTable");
  tbody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

  try {
    const res = await fetch(
      "http://localhost:3100/admin/services/getallfeedback"
    );
    const json = await safeJson(res);
    allFeedbackData = Array.isArray(json?.data) ? json.data : [];

    tbody.innerHTML = allFeedbackData.length
      ? allFeedbackData
          .map(
            (f, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${escapeHtml(f.name)}</td>
              <td>${escapeHtml(f.email)}</td>
              <td>${escapeHtml(f.subject)}</td>
              <td>${escapeHtml(f.message)}</td>
              <td>${escapeHtml(new Date(f.createdAt).toLocaleString())}</td>
            </tr>
          `
          )
          .join("")
      : `<tr><td colspan="6">No feedback found</td></tr>`;

    showNotification("Feedback forms loaded");
  } catch {
    tbody.innerHTML = `<tr><td colspan="6">Error loading feedback</td></tr>`;
    showNotification("Failed to load feedback");
  }
}

function searchFeedback() {
  const q = document.getElementById("searchFeedback").value.toLowerCase();
  const filtered = allFeedbackData.filter((f) =>
    [f.name, f.email, f.subject, f.message].join(" ").toLowerCase().includes(q)
  );
  const tbody = document.getElementById("feedbackTable");
  tbody.innerHTML = filtered.length
    ? filtered
        .map(
          (f, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(f.name)}</td>
            <td>${escapeHtml(f.email)}</td>
            <td>${escapeHtml(f.subject)}</td>
            <td>${escapeHtml(f.message)}</td>
            <td>${escapeHtml(new Date(f.createdAt).toLocaleString())}</td>
          </tr>`
        )
        .join("")
    : `<tr><td colspan="6">No feedback found</td></tr>`;
}

/* ========== Init Dashboard ========== */
document.addEventListener("DOMContentLoaded", fetchDashboardStats);
