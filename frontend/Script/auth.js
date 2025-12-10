// -------------------------
// Helpers & initial setup
// -------------------------
window.addEventListener("load", () => {
  document.querySelectorAll("input").forEach((i) => (i.value = ""));
});

// ===================== Top Notification =====================
function showNotification(message) {
  const notification = document.getElementById("topNotification");
  notification.textContent = message;
  notification.style.top = "20px";
  setTimeout(() => {
    notification.style.top = "-60px";
  }, 3000);
}

// Role/Form references
const subtitle = document.getElementById("subtitle");
const roleSelect = document.getElementById("roleSelect");
const adminForm = document.getElementById("adminForm");
const donorForm = document.getElementById("donorForm");
const donorLoginSection = document.getElementById("donorLoginSection");
const donorSignupForm = document.getElementById("donorSignupForm");
const bloodbankForms = document.getElementById("bloodbankForms");

function showForm(role) {
  roleSelect.style.display = "none";
  if (role === "admin") {
    subtitle.textContent = "Admin Login – Access your dashboard";
    adminForm.classList.remove("hidden");
  } else if (role === "donor") {
    subtitle.textContent =
      "Thank you for helping save lives! Please enter your details below.";
    donorForm.classList.remove("hidden");
  } else if (role === "bloodbank") {
    subtitle.textContent =
      "Your contribution helps save lives! Enter your details below.";
    bloodbankForms.classList.remove("hidden");
  }
}

// Password toggle (works for all existing .toggle-password icons)
function initPasswordToggles() {
  document.querySelectorAll(".toggle-password").forEach((icon) => {
    // Remove previous listeners by cloning node (safe)
    const newIcon = icon.cloneNode(true);
    icon.parentNode.replaceChild(newIcon, icon);
  });
  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", () => {
      const input = icon.previousElementSibling;
      if (!input) return;
      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });
}
initPasswordToggles();

// ===================== Leaflet Map =====================
const mapModal = document.getElementById("mapModal");
const donorAddressInput = document.getElementById("donorAddress");
let map, marker;

donorAddressInput.addEventListener("click", () => {
  mapModal.style.display = "flex";

  // Initialize map only once
  if (!map) {
    map = L.map("map").setView([31.1471, 75.3412], 7); // Default Punjab, India

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Click to place marker
    map.on("click", function (e) {
      if (marker) map.removeLayer(marker);
      marker = L.marker(e.latlng).addTo(map);
    });
  }
});

document.getElementById("confirmAddressBtn").addEventListener("click", () => {
  if (marker) {
    const { lat, lng } = marker.getLatLng();
    donorAddressInput.value = lat.toFixed(6) + ", " + lng.toFixed(6);
    mapModal.style.display = "none";
    showNotification("Address selected successfully");
  } else {
    showNotification("Please select a location on the map");
  }
});

// Close modal on outside click
mapModal.addEventListener("click", (e) => {
  if (e.target === mapModal) mapModal.style.display = "none";
});

// -------------------------
// Donor login/signup toggles
// -------------------------
const donorToggle = document.getElementById("donorToggle");
const donorToggleBack = document.getElementById("donorToggleBack");
const donorLoginPasswordForm = document.getElementById(
  "donorLoginPasswordForm"
);
const donorLoginOtpForm = document.getElementById("donorLoginOtpForm");

donorToggle.addEventListener("click", () => {
  donorLoginSection.classList.add("hidden");
  donorSignupForm.classList.remove("hidden");
});
donorToggleBack.addEventListener("click", () => {
  donorSignupForm.classList.add("hidden");
  donorLoginSection.classList.remove("hidden");
});

// Login tab switching
const donorPasswordTab = document.getElementById("donorPasswordTab");
const donorOtpTab = document.getElementById("donorOtpTab");

donorPasswordTab.addEventListener("click", () => {
  donorPasswordTab.classList.add("active");
  donorOtpTab.classList.remove("active");
  donorLoginPasswordForm.classList.remove("hidden");
  donorLoginOtpForm.classList.add("hidden");
});
donorOtpTab.addEventListener("click", () => {
  donorOtpTab.classList.add("active");
  donorPasswordTab.classList.remove("active");
  donorLoginOtpForm.classList.remove("hidden");
  donorLoginPasswordForm.classList.add("hidden");
});

// -------------------------
// Donor login (password)
// -------------------------
donorLoginPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("donorEmail").value.trim();
  const password = document.getElementById("donorPassword").value.trim();
  if (!email || !password) {
    showNotification("Please enter both email and password.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3100/donor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const data = await res.json();
    showNotification(data.message);
    if (res.ok)
      setTimeout(() => {
        window.location.href = "donordashboard.html";
      }, 1500);
  } catch (err) {
    console.error(err);
    showNotification("Something went wrong. Try again later.");
  }
});

// -------------------------
// Donor login (OTP)
// -------------------------
const sendOtpBtn = document.getElementById("sendOtp");
const resendOtpBtn = document.getElementById("resendOtp");
const loginOtpDetail = document.getElementById("loginOtpDetail");
const otpInput = document.getElementById("otpInput");
let resendTimer = 30,
  resendInterval = null;

function startResendTimer() {
  if (resendInterval) clearInterval(resendInterval);
  resendTimer = 30;
  resendOtpBtn.classList.add("disabled");
  resendOtpBtn.textContent = `Resend OTP (${resendTimer})`;
  resendInterval = setInterval(() => {
    resendTimer--;
    resendOtpBtn.textContent = `Resend OTP (${resendTimer})`;
    if (resendTimer <= 0) {
      clearInterval(resendInterval);
      resendOtpBtn.textContent = "Resend OTP";
      resendOtpBtn.classList.remove("disabled");
    }
  }, 1000);
}

sendOtpBtn.addEventListener("click", async () => {
  const detail = loginOtpDetail.value.trim();
  if (!detail) {
    showNotification("Please enter email or phone number.");
    return;
  }
  try {
    const res = await fetch("http://localhost:3100/donor/loginwithotp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: detail, phonenumber: detail }),
      credentials: "include",
    });
    const data = await res.json();
    showNotification(data.message);
    if (res.ok) startResendTimer();
  } catch (err) {
    console.error(err);
    showNotification("Failed to send OTP. Try again.");
  }
});

resendOtpBtn.addEventListener("click", async () => {
  if (resendOtpBtn.classList.contains("disabled")) return;
  const detail = loginOtpDetail.value.trim();
  if (!detail) {
    showNotification("Please enter email or phone number.");
    return;
  }
  try {
    const res = await fetch("http://localhost:3100/donor/resendloginotp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: detail, phonenumber: detail }),
      credentials: "include",
    });
    const data = await res.json();
    showNotification(data.message);
    if (res.ok) startResendTimer();
  } catch (err) {
    console.error(err);
    showNotification("Failed to resend OTP. Try again.");
  }
});

donorLoginOtpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const detail = loginOtpDetail.value.trim();
  const otp = otpInput.value.trim();
  if (!detail || !otp) {
    showNotification("Please enter email/phone and OTP.");
    return;
  }
  try {
    const res = await fetch("http://localhost:3100/donor/verifylogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: detail,
        phonenumber: detail,
        loginotp: otp,
      }),
      credentials: "include",
    });
    const data = await res.json();
    showNotification(data.message);
    if (res.ok)
      setTimeout(() => {
        window.location.href = "donordashboard.html";
      }, 1500);
  } catch (err) {
    console.error(err);
    showNotification("OTP verification failed. Try again.");
  }
});

// -------------------------
// Donor Forgot Password multi-step
// -------------------------
const donorForgotLink = document.getElementById("donorForgotPassword");
const donorForgotSection = document.getElementById("donorForgotSection");
const forgotStep1 = document.getElementById("forgotStep1");
const forgotStep2 = document.getElementById("forgotStep2");
const forgotStep3 = document.getElementById("forgotStep3");
const fpSendOtpBtn = document.getElementById("fpSendOtpBtn");
const fpContactInput = document.getElementById("fpContact");
const fpVerifyContact = document.getElementById("fpVerifyContact");
const fpResetContact = document.getElementById("fpResetContact");
const fpOtpInput = document.getElementById("fpOtpInput");
const fpResendOtp = document.getElementById("fpResendOtp");
const fpVerifyBtn = document.getElementById("fpVerifyBtn");
const fpNewPassword = document.getElementById("fpNewPassword");
const fpConfirmNewPassword = document.getElementById("fpConfirmNewPassword");
const fpResetBtn = document.getElementById("fpResetBtn");
const fpBack1 = document.getElementById("fpBack1");
const fpBack2 = document.getElementById("fpBack2");
const fpBack3 = document.getElementById("fpBack3");

let fpContactValue = "";
let fpTimer = 30,
  fpInterval = null;

// Open forgot flow
donorForgotLink.addEventListener("click", (e) => {
  e.preventDefault();
  donorLoginSection.classList.add("hidden");
  forgotStep2.classList.add("hidden");
  forgotStep3.classList.add("hidden");
  forgotStep1.classList.remove("hidden");
  donorForgotSection.classList.remove("hidden");
  // clear fields
  fpContactInput.value = "";
  fpOtpInput.value = "";
  fpNewPassword.value = "";
  fpConfirmNewPassword.value = "";
  initPasswordToggles(); // ensure toggles exist
});

// Back links: hide forgot and return to login
[fpBack1, fpBack2, fpBack3].forEach((btn) => {
  btn.addEventListener("click", (ev) => {
    ev.preventDefault();
    donorForgotSection.classList.add("hidden");
    donorLoginSection.classList.remove("hidden");
    // reset steps
    forgotStep1.classList.remove("hidden");
    forgotStep2.classList.add("hidden");
    forgotStep3.classList.add("hidden");
    // clear any timers
    if (fpInterval) {
      clearInterval(fpInterval);
      fpInterval = null;
    }
    fpResendOtp.classList.remove("disabled");
    fpResendOtp.textContent = "Resend OTP (30)";
  });
});

// Start forgot OTP countdown
function startFpCountdown() {
  if (fpInterval) clearInterval(fpInterval);
  fpTimer = 30;
  fpResendOtp.classList.add("disabled");
  fpResendOtp.textContent = `Resend OTP (${fpTimer})`;
  fpInterval = setInterval(() => {
    fpTimer--;
    fpResendOtp.textContent = `Resend OTP (${fpTimer})`;
    if (fpTimer <= 0) {
      clearInterval(fpInterval);
      fpResendOtp.textContent = "Resend OTP";
      fpResendOtp.classList.remove("disabled");
      fpInterval = null;
    }
  }, 1000);
}

// Step 1: send OTP for reset
fpSendOtpBtn.addEventListener("click", async () => {
  const contact = fpContactInput.value.trim();
  if (!contact) {
    showNotification("Please enter email or phone.");
    return;
  }
  fpContactValue = contact;
  try {
    const res = await fetch("http://localhost:3100/donor/forgotpassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: contact, phonenumber: contact }),
      credentials: "include",
    });
    const data = await res.json();
    showNotification(data.message);
    if (res.ok) {
      // fill readonly contact fields in next steps
      fpVerifyContact.value = contact;
      fpResetContact.value = contact;
      // switch to step 2
      forgotStep1.classList.add("hidden");
      forgotStep2.classList.remove("hidden");
      startFpCountdown();
    }
  } catch (err) {
    console.error(err);
    showNotification("Failed to send OTP. Try again.");
  }
});

// Resend OTP in forgot flow
fpResendOtp.addEventListener("click", async () => {
  if (fpResendOtp.classList.contains("disabled")) return;
  if (!fpContactValue) {
    showNotification("No contact to resend OTP to.");
    return;
  }
  try {
    const res = await fetch("http://localhost:3100/donor/resendforgototp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fpContactValue,
        phonenumber: fpContactValue,
      }),
      credentials: "include",
    });
    const data = await res.json();
    showNotification(data.message);
    if (res.ok) startFpCountdown();
  } catch (err) {
    console.error(err);
    showNotification("Failed to resend OTP. Try again.");
  }
});

// Step 2: verify OTP
fpVerifyBtn.addEventListener("click", async () => {
  const otp = fpOtpInput.value.trim();
  if (!otp) {
    showNotification("Please enter OTP.");
    return;
  }
  try {
    const res = await fetch(
      "http://localhost:3100/donor/verifyforgotpassword",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fpContactValue,
          phonenumber: fpContactValue,
          otp: otp,
        }),
        credentials: "include",
      }
    );
    const data = await res.json();
    showNotification(data.message);
    if (res.ok) {
      // move to reset password
      forgotStep2.classList.add("hidden");
      forgotStep3.classList.remove("hidden");
      // clear resend timer
      if (fpInterval) {
        clearInterval(fpInterval);
        fpInterval = null;
      }
      fpResendOtp.classList.remove("disabled");
      fpResendOtp.textContent = "Resend OTP (30)";
      initPasswordToggles();
    }
  } catch (err) {
    console.error(err);
    showNotification("OTP verification failed. Try again.");
  }
});

// Step 3: reset password
fpResetBtn.addEventListener("click", async () => {
  const newpassword = fpNewPassword.value.trim();
  const confirmnewpassword = fpConfirmNewPassword.value.trim();
  if (!newpassword || !confirmnewpassword) {
    showNotification("Please fill both password fields.");
    return;
  }
  if (newpassword !== confirmnewpassword) {
    showNotification("Passwords do not match.");
    return;
  }
  try {
    const res = await fetch("http://localhost:3100/donor/resetpassword", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fpContactValue,
        phonenumber: fpContactValue,
        newpassword,
        confirmnewpassword,
      }),
      credentials: "include",
    });
    const data = await res.json();
    showNotification(data.message);
    if (res.ok) {
      // clear and go back to donor login (password)
      setTimeout(() => {
        // clear all forgot inputs
        fpContactInput.value = "";
        fpOtpInput.value = "";
        fpNewPassword.value = "";
        fpConfirmNewPassword.value = "";
        // hide forgot section
        donorForgotSection.classList.add("hidden");
        // reveal login with password and prefill contact email if it's an email
        donorLoginSection.classList.remove("hidden");
        donorLoginPasswordForm.classList.remove("hidden");
        donorLoginOtpForm.classList.add("hidden");
        // optional: if contact looks like email, fill email field
        if (fpContactValue.includes("@"))
          document.getElementById("donorEmail").value = fpContactValue;
        fpContactValue = "";
      }, 1200);
    }
  } catch (err) {
    console.error(err);
    showNotification("Failed to reset password. Try again.");
  }
});

// -------------------------
// Blood Bank toggles
// -------------------------
const bbToggle = document.getElementById("bbToggle");
const bbToggleBack = document.getElementById("bbToggleBack");
const bbLoginForm2 = document.getElementById("bbLoginForm");
const bbSignupForm1 = document.getElementById("bbSignupForm");
bbToggle &&
  bbToggle.addEventListener("click", () => {
    bbLoginForm2.classList.add("hidden");
    bbSignupForm1.classList.remove("hidden");
  });
bbToggleBack &&
  bbToggleBack.addEventListener("click", () => {
    bbSignupForm1.classList.add("hidden");
    bbLoginForm2.classList.remove("hidden");
  });

donorSignupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const gender = donorSignupForm.querySelector(
    'input[name="gender"]:checked'
  ).id;
  const email = document.getElementById("email").value.trim();
  const phonenumber = document.getElementById("phonenumber").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmpassword = document
    .getElementById("confirmPassword")
    .value.trim();
  const bloodgroup = document.getElementById("bloodgroup").value;
  const address = document.getElementById("donorAddress").value.trim();

  try {
    const res = await fetch("http://localhost:3100/donor/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        age,
        gender,
        email,
        phonenumber,
        password,
        confirmpassword,
        bloodgroup,
        address,
      }),
      credentials: "include",
    });

    const result = await res.json();
    showNotification(result.message);

    if (res.ok) {
      // Hide signup form and show donor signup OTP modal
      donorSignupForm.style.display = "none";
      const donorSignupOtpModal = document.getElementById(
        "donorSignupOtpModal"
      );
      donorSignupOtpModal.style.display = "flex";

      // Store email & phone for verification
      const emailInput = email;
      const phoneInput = phonenumber;

      const emailOtpInput = document.getElementById("signupEmailOtp");
      const phoneOtpInput = document.getElementById("signupPhoneOtp");
      const verifyBtn = document.getElementById("signupVerifyBtn");
      const resendBtn = document.getElementById("signupResendBtn");
      const resendTimerEl = document.getElementById("signupResendTimer");

      let resendTime = 30;
      let resendInterval;

      function startResendTimer() {
        clearInterval(resendInterval);
        resendTime = 30;
        resendTimerEl.textContent = `(${resendTime})`;
        resendBtn.disabled = true;

        resendInterval = setInterval(() => {
          resendTime--;
          resendTimerEl.textContent = `(${resendTime})`;
          if (resendTime <= 0) {
            clearInterval(resendInterval);
            resendTimerEl.textContent = "";
            resendBtn.disabled = false;
          }
        }, 1000);
      }

      startResendTimer();

      // Verify OTP
      verifyBtn.onclick = async () => {
        const emailotp = emailOtpInput.value.trim();
        const phoneotp = phoneOtpInput.value.trim();
        if (!emailotp || !phoneotp) {
          showNotification("Please enter both OTPs.");
          return;
        }

        try {
          const verifyRes = await fetch(
            "http://localhost:3100/donor/verification",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: emailInput,
                phonenumber: phoneInput,
                emailotp,
                phoneotp,
              }),
              credentials: "include",
            }
          );

          const verifyData = await verifyRes.json();
          showNotification(verifyData.message);

          if (verifyRes.ok) {
            donorSignupOtpModal.style.display = "none";
            donorSignupForm.reset();
            donorLoginSection.classList.remove("hidden");
            donorLoginPasswordForm.classList.remove("hidden");
            donorLoginOtpForm.classList.add("hidden");
            document.getElementById("donorEmail").value = emailInput;
          }
        } catch (err) {
          console.error(err);
          showNotification("OTP verification failed. Try again.");
        }
      };

      // Resend OTP
      resendBtn.onclick = async () => {
        if (resendTime > 0) return; // prevent early click
        try {
          const resendRes = await fetch(
            "http://localhost:3100/donor/resendotp",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: emailInput,
                phonenumber: phoneInput,
              }),
              credentials: "include",
            }
          );

          const resendData = await resendRes.json();
          showNotification(resendData.message);
          if (resendRes.ok) startResendTimer();
        } catch (err) {
          console.error(err);
          showNotification("Failed to resend OTP.");
        }
      };
    }
  } catch (err) {
    console.error(err);
    showNotification("Signup failed. Try again.");
  }
});

// -------------------------
// Admin form submit (unchanged)
// -------------------------

adminForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("adminusername").value;
  const password = document.getElementById("adminpassword").value;

  try {
    const res = await fetch("http://localhost:3100/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    const data = await res.json();
    showNotification(data.message);
    if (res.ok)
      setTimeout(() => {
        window.location.href = "admindashboard.html";
      }, 1500);
  } catch (error) {
    console.log(error);
    showNotification("Something Went Wrong. Try again Later.");
  }
});

initPasswordToggles();

// ===================== Leaflet Map for Blood Bank =====================
const bloodbankMapAddressInput = document.getElementById("bloodbankmapaddress");
let bbMap, bbMarker;

// Reuse same mapModal or create a new one for blood bank
const bbMapModal = document.createElement("div");
bbMapModal.id = "bbMapModal";
bbMapModal.style.cssText =
  "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:none;align-items:center;justify-content:center;z-index:2000;";
bbMapModal.innerHTML = `
      <div id="bbMapContainer" style="background:white;padding:1rem;border-radius:10px;max-width:600px;width:90%;height:80vh;display:flex;flex-direction:column;gap:10px;">
        <div id="bbMap" style="flex:1;border-radius:10px;"></div>
        <button id="bbConfirmAddressBtn" class="btn" style="align-self:center;width:50%;">Confirm Address</button>
      </div>`;
document.body.appendChild(bbMapModal);

bloodbankMapAddressInput.addEventListener("click", () => {
  bbMapModal.style.display = "flex";
  if (!bbMap) {
    bbMap = L.map("bbMap").setView([31.1471, 75.3412], 7); // Punjab default
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(bbMap);

    bbMap.on("click", function (e) {
      if (bbMarker) bbMap.removeLayer(bbMarker);
      bbMarker = L.marker(e.latlng).addTo(bbMap);
    });
  }
});

document.getElementById("bbConfirmAddressBtn").addEventListener("click", () => {
  if (bbMarker) {
    const { lat, lng } = bbMarker.getLatLng();
    bloodbankMapAddressInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    bbMapModal.style.display = "none";
    showNotification("Blood bank address selected successfully");
  } else {
    showNotification("Please select a location on the map");
  }
});

bbMapModal.addEventListener("click", (e) => {
  if (e.target === bbMapModal) bbMapModal.style.display = "none";
});

// ==================== Blood Bank Signup Form Submission ====================
const bbSignupForm = document.getElementById("bbSignupForm");

bbSignupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const bloodbankname = document.getElementById("bloodbankname").value.trim();
  const registrationid = document.getElementById("registrationid").value.trim();
  const email = document.getElementById("bloodbankemail").value.trim();
  const phonenumber = document.getElementById("bloodbankphone").value.trim();
  const password = document.getElementById("bloodbankpassword").value.trim();
  const confirmpassword = document
    .getElementById("bloodbankconfirmpassword")
    .value.trim();
  const address = document.getElementById("bloodbankaddress").value.trim();
  const maplocation = document
    .getElementById("bloodbankmapaddress")
    .value.trim();

  if (
    !bloodbankname ||
    !registrationid ||
    !email ||
    !phonenumber ||
    !password ||
    !confirmpassword ||
    !address ||
    !maplocation
  ) {
    showNotification(" Please fill in all fields before submitting.");
    return;
  }

  const payload = {
    bloodbankname,
    registrationid,
    email,
    phonenumber,
    password,
    confirmpassword,
    address,
    maplocation,
  };

  try {
    const res = await fetch("http://localhost:3100/bloodbank/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      showNotification(data.message);
      bbSignupForm.reset();
    } else {
      showNotification(data.message);
    }
  } catch (err) {
    console.error("Error during registration:", err);
    showNotification(" Something went wrong . Try again later.");
  }
});
// ==================== BLOOD BANK LOGIN ====================
const bbLoginForm1 = document.getElementById("bbLoginForm");
const bloodbankEmail = document.getElementById("bloodbankEmail");
const bloodbankPassword = document.getElementById("bloodbankPassword");

bbLoginForm1.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = bloodbankEmail.value.trim();
  const password = bloodbankPassword.value.trim();

  if (!email || !password) {
    showNotification("Please fill in both email and password.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3100/bloodbank/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await res.json();
    showNotification(data.message);

    if (res.ok) {
      setTimeout(() => {
        window.location.href = "bloodbankdashboard.html";
      }, 1500);
    }
  } catch (err) {
    console.error("Blood bank login failed:", err);
    showNotification(data.message);
  }
});
// ============ BLOOD BANK FORGOT PASSWORD FLOW ============

const bbLoginForm = document.getElementById("bbLoginForm");
const bbForgotPasswordForm = document.getElementById("bbForgotPasswordForm");
const bbVerifyOtpForm = document.getElementById("bbVerifyOtpForm");
const bbResetPasswordForm = document.getElementById("bbResetPasswordForm");

// Forgot link click
document
  .querySelector("#bloodbankForms a.toggle-link[href='#']")
  .addEventListener("click", (e) => {
    e.preventDefault();
    bbLoginForm.classList.add("hidden");
    bbForgotPasswordForm.classList.remove("hidden");
  });

// Back to login
document.getElementById("bbForgotBack").addEventListener("click", (e) => {
  e.preventDefault();
  bbForgotPasswordForm.classList.add("hidden");
  bbLoginForm.classList.remove("hidden");
});

// Step 1: Send OTP
bbForgotPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("bbForgotEmail").value.trim();
  if (!email) return showNotification("Please enter your email");

  try {
    const res = await fetch("http://localhost:3100/bloodbank/forgotpassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    });

    const data = await res.json();
    showNotification(data.message);

    if (res.ok) {
      document.getElementById("bbVerifyEmail").value = email;
      bbForgotPasswordForm.classList.add("hidden");
      bbVerifyOtpForm.classList.remove("hidden");
    }
  } catch (err) {
    showNotification("Failed to send OTP. Try again.");
  }
});

// Step 2: Verify OTP
bbVerifyOtpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("bbVerifyEmail").value;
  const otp = document.getElementById("bbOtp").value.trim();

  try {
    const res = await fetch("http://localhost:3100/bloodbank/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, otp }),
    });

    const data = await res.json();
    showNotification(data.message);

    if (res.ok) {
      bbVerifyOtpForm.classList.add("hidden");
      bbResetPasswordForm.classList.remove("hidden");
    }
  } catch (err) {
    showNotification("OTP verification failed");
  }
});

// Step 3: Reset Password
bbResetPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("bbVerifyEmail").value;
  const newPassword = document.getElementById("bbNewPassword").value;
  const confirmPassword = document.getElementById("bbConfirmPassword").value;

  if (newPassword !== confirmPassword) {
    showNotification("Passwords do not match");
    return;
  }

  try {
    const res = await fetch("http://localhost:3100/bloodbank/resetpassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        newpassword: newPassword,
        confirmnewpassword: confirmPassword,
      }),
    });

    const data = await res.json();
    showNotification(data.message);

    if (res.ok) {
      bbResetPasswordForm.classList.add("hidden");
      bbLoginForm.classList.remove("hidden");
    }
  } catch (err) {
    console.log(err);
    showNotification("Error resetting password. Try again.");
  }
});
// Step 2.1: Resend OTP
const bbResendOtp = document.getElementById("bbResendOtp");

if (bbResendOtp) {
  bbResendOtp.addEventListener("click", async () => {
    const email = document.getElementById("bbVerifyEmail").value;
    if (!email) {
      showNotification("Email not found. Please restart the process.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3100/bloodbank/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      const data = await res.json();
      showNotification(data.message);
    } catch (err) {
      showNotification("Failed to resend OTP. Try again.");
    }
  });
}
