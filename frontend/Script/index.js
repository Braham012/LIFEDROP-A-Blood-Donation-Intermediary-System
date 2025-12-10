function goToEmergency() {
  setTimeout(() => {
    window.location.href = "emergency.html";
  }, 400);
}

function gotoauth() {
  setTimeout(() => {
    window.location.href = "auth.html";
  }, 400);
}

// DOM Elements
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const donationForm = document.getElementById("donationForm");
const contactForm = document.getElementById("contactForm");
const statNumbers = document.querySelectorAll(".stat-number");

// Navigation Toggle
navToggle?.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  navToggle.classList.toggle("active");
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");
  });
});

// Smooth scroll to section
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Animated counters for hero stats
function animateCounters() {
  statNumbers.forEach((stat) => {
    const target = parseInt(stat.getAttribute("data-target"));
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      stat.textContent = Math.floor(current).toLocaleString();
    }, 20);
  });
}

// Blood type compatibility checker
const bloodCompatibility = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

function checkCompatibility() {
  const donorType = document.getElementById("donorBloodType").value;
  const resultDiv = document.getElementById("compatibilityResult");

  if (!donorType) {
    resultDiv.innerHTML = "<p>Please select your blood type first.</p>";
    resultDiv.className = "compatibility-result";
    return;
  }

  const compatible = bloodCompatibility[donorType];
  const isUniversal = donorType === "O-";

  if (isUniversal) {
    resultDiv.innerHTML = `
            <p><strong>You are a Universal Donor! 🌟</strong></p>
            <p>Your ${donorType} blood can be donated to ALL blood types: ${compatible.join(
      ", "
    )}</p>
            <p>You are especially needed in emergency situations!</p>
        `;
    resultDiv.className = "compatibility-result success";
  } else {
    resultDiv.innerHTML = `
            <p><strong>Your ${donorType} blood can help people with these blood types:</strong></p>
            <p>${compatible.join(", ")}</p>
            <p>Every donation matters and can save lives!</p>
        `;
    resultDiv.className = "compatibility-result info";
  }
}

// Form validation and submission
function validateForm(form) {
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

  // Email validation
  const emailFields = form.querySelectorAll('input[type="email"]');
  emailFields.forEach((field) => {
    if (field.value && !isValidEmail(field.value)) {
      field.style.borderColor = "var(--error-color)";
      isValid = false;
    }
  });

  // Phone validation
  const phoneFields = form.querySelectorAll('input[type="tel"]');
  phoneFields.forEach((field) => {
    if (field.value && !isValidPhone(field.value)) {
      field.style.borderColor = "var(--error-color)";
      isValid = false;
    }
  });

  // Date validation (future dates only)
  const dateFields = form.querySelectorAll('input[type="date"]');
  dateFields.forEach((field) => {
    if (field.value) {
      const selectedDate = new Date(field.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        field.style.borderColor = "var(--error-color)";
        showNotification(
          "Please select a future date for your appointment.",
          "error"
        );
        isValid = false;
      }
    }
  });

  return isValid;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm(contactForm)) {
    showNotification("Please fill in all required fields correctly.", "error");
    return;
  }

  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch("http://localhost:3100/feedback/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      showNotification(result.message, "success");
      contactForm.reset();
    } else {
      showNotification(result.message, "error");
    }
  } catch (err) {
    console.error(err);
    showNotification(result.message, "error");
  }
});

// Emergency request handler
function handleEmergencyRequest() {
  setTimeout(() => {
    window.location.href = "respondtoemergency.html";
  }, 500);
}

// Notification system
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;

  // Add to DOM
  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

function getNotificationIcon(type) {
  switch (type) {
    case "success":
      return "fa-check-circle";
    case "error":
      return "fa-exclamation-circle";
    case "warning":
      return "fa-exclamation-triangle";
    default:
      return "fa-info-circle";
  }
}

function getNotificationColor(type) {
  switch (type) {
    case "success":
      return "var(--success-color)";
    case "error":
      return "var(--error-color)";
    case "warning":
      return "var(--warning-color)";
    default:
      return "var(--primary-color)";
  }
}

// Add notification animations to CSS
const notificationStyles = document.createElement("style");
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(notificationStyles);

// Scroll animations
function handleScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    ".about-card, .blood-type-card, .process-step, .center-card"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  animatedElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(element);
  });
}

// Set minimum date for appointment booking (today)
function setMinimumDate() {
  const dateField = document.getElementById("preferredDate");
  if (dateField) {
    const today = new Date().toISOString().split("T")[0];
    dateField.setAttribute("min", today);
  }
}

// Header scroll effect
function handleHeaderScroll() {
  const header = document.querySelector(".header");
  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 100) {
      header.style.background = "rgba(255, 255, 255, 0.98)";
      header.style.borderBottomWidth = "2px";
    } else {
      header.style.background = "rgba(255, 255, 255, 0.95)";
      header.style.borderBottomWidth = "1px";
    }

    // Hide header when scrolling down, show when scrolling up
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      header.style.transform = "translateY(-100%)";
    } else {
      header.style.transform = "translateY(0)";
    }

    lastScrollY = currentScrollY;
  });
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Start counter animation when hero section is visible
  const heroSection = document.getElementById("home");
  if (heroSection) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            heroObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    heroObserver.observe(heroSection);
  }

  // Initialize other features
  handleScrollAnimations();
  setMinimumDate();
  handleHeaderScroll();

  // Add loading animation to page
  document.body.style.opacity = "0";
  setTimeout(() => {
    document.body.style.transition = "opacity 0.5s ease";
    document.body.style.opacity = "1";
  }, 100);
});

// Handle window resize
window.addEventListener("resize", () => {
  // Close mobile menu on resize
  if (window.innerWidth > 768) {
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");
  }
});

// Add keyboard navigation support
document.addEventListener("keydown", (e) => {
  // Escape key closes modals/menus
  if (e.key === "Escape") {
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");

    // Close notifications
    const notifications = document.querySelectorAll(".notification");
    notifications.forEach((notification) => notification.remove());
  }

  // Enter key on buttons
  if (e.key === "Enter" && e.target.tagName === "BUTTON") {
    e.target.click();
  }
});

// Performance optimization: lazy load images
function lazyLoadImages() {
  const images = document.querySelectorAll("img[data-src]");

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

// Add error handling for form submissions
window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.error);
  showNotification(
    "An error occurred. Please try again or contact support.",
    "error"
  );
});

// Add unhandled promise rejection handling
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);
  showNotification("An unexpected error occurred. Please try again.", "error");
});

// Export functions for potential external use
window.BloodDonationApp = {
  scrollToSection,
  checkCompatibility,
  handleEmergencyRequest,
  showNotification,
};

function initMap() {
  const map = L.map("map").setView([31.634, 75.123], 15); // Center at Punjab

  // OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Donation centers
  const donationCenters = [
    {
      name: "Blood Bank, Gurdaspur",
      address: "Babbar Heart Centre, Gurdaspur, Punjab 143521",
      position: [32.0338, 75.4052],
      phone: "0187 4240009",
    },
    {
      name: "Guru Nanak Dev Hospital Blood Bank",
      address: "Majitha Road, Amritsar, Punjab 143001",
      position: [31.6339, 74.8723],
      phone: "0183 2426918",
    },
    {
      name: "Blood Bank, Pathankot",
      address: "Shahpur Road, Pathankot, Punjab 145001",
      position: [32.2658, 75.646],
      phone: "0186 2250160",
    },
    {
      name: "Blood Bank, Mukerian",
      address: "Model Town, Mukerian, Punjab 144211",
      position: [31.9473, 75.5767],
      phone: "0188 3244702",
    },
  ];

  // Add markers
  donationCenters.forEach((center) => {
    L.marker(center.position)
      .addTo(map)
      .bindPopup(
        `<strong>${center.name}</strong><br>${center.address}<br>Phone: ${center.phone}`
      );
  });

  // Fit map to all markers
  const group = new L.featureGroup(
    donationCenters.map((c) => L.marker(c.position))
  );
  map.fitBounds(group.getBounds().pad(0.1));
}

document.addEventListener("DOMContentLoaded", initMap);
