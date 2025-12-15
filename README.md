# 🩸 LIFEDROP – Blood Donation Intermediary System

LifeDrop is a modern web-based platform designed to streamline blood donation by connecting donors, patients, hospitals, and verified blood banks in real time.
It ensures faster emergency response, geographic donor matching, secure communication, and a smooth, user-friendly interface for all users.

---

## 📌 Overview

LifeDrop is a real-time blood donation management platform designed to connect donors, patients, hospitals, and verified blood banks efficiently.
It solves common issues like delayed donor matching, unreliable requests, and lack of centralized coordination by providing an automated, location-based system.

The platform uses smart 15 km radius matching to notify compatible donors instantly during emergencies, ensuring faster response times.
Users can also schedule donations, check blood compatibility, view pinned blood bank locations, and communicate directly with donors or recipients.

With a clean interface, strong security, and an admin dashboard for monitoring system activity,
LifeDrop creates a reliable, transparent, and community-driven ecosystem that improves accessibility and helps save lives.

---

## ✨ Features

### ⭐ User Features

- **Donor Registration & Login** – Secure signup with phone/email validation and hashed passwords.
- **Profile Management** – Update personal info, blood group, location, and donation history.
- **Blood Compatibility Checker** – Instantly check who can donate or receive blood safely.
- **Why Donate Section** – Educates users on benefits and importance of regular blood donation.
- **View Verified Blood Banks** – Access trusted blood banks pinned on an interactive map.
- **Scheduled Blood Donations** – Pre-book appointments with verified blood banks.
- **Emergency Blood Requests** – Raise urgent 12–24 hour requests with description & location.
- **Direct Donor–Recipient Contact** – Users can connect directly after matching.
- **Geolocation-Based Matching** – Automatically identifies compatible donors within 15 km.
- **Real-Time Notifications** – Alerts sent via Email & WhatsApp for immediate responses.
- **Smooth Single-Page Navigation** – Fast transitions with clean UI and mobile responsiveness.

### 🚨 Emergency Handling

- **Instant Trigger System** – Requests reach donors immediately with essential details.
- **12-Hour & 24-Hour Request Filters** – Prioritized emergency dashboard for quick viewing.
- **Live Tracking of Requests** – Monitor active alerts and donor responses in real-time.
- **Verified Requests Only** – Prevents spam/fake requests using validation and admin checks.

### 🛠 Admin Dashboard Features

- **Manage All Users** – View, verify, and filter registered donors & recipients.
- **Blood Bank Verification** – Approve or reject blood banks to maintain platform trust.
- **Monitor Emergency Requests** – View requests from the last 12 or 24 hours.
- **View Schedules & Donations** – Track upcoming donations and completed entries.
- **Feedback Management System** – Collect, review, and resolve user feedback.
- **Role-Based Access** – Separate privileges for admin and regular users.

### 🌐 Platform & System Features 

- **JWT Authentication** – Safe login system with secure access tokens.
- **Password Hashing with Bcrypt** – Ensures user credentials remain protected.
- **WhatsApp Notification System** – Fast emergency alerts using whatsapp-web.js.
- **Email Alerts (Nodemailer)** – For OTP, verification, and donation reminders.
- **Phone Number Validation** – Ensures valid contact numbers using libphonenumber-js.
- **Environment-Based Configuration** – Using dotenv for secure environment variables.

---

## 🛠 Technology Stack

### Backend & Server

- Node.js & Express.js – Server-side logic and REST APIs
- MongoDB & Mongoose – Database for users, requests, schedules, and blood banks
- JWT (jsonwebtoken) – Secure authentication and authorization
- Bcrypt – Password hashing for safe credential storage
- Geolib – Distance calculation for 15 km radius donor matching
- Whatsapp-web.js – Real-time WhatsApp notifications
- Nodemailer – Email notifications for OTP, alerts, and updates

### Frontend & Styling

- HTML5 & CSS3 – Structure and responsive page design
- JavaScript (Vanilla JS) – Dynamic UI and smooth single-page navigation
- Leaflet.js – Map integration for blood bank and donor location

### Other Libraries & Utilities

- Cors – Cross-origin resource sharing
- Dotenv – Environment variable management
- Libphonenumber-js – Phone number validation
- OTP-generator – Secure OTP creation for verification
- Cookie-parser – Cookie handling
- Nodemon – Auto server restart during development

---

## 🚀 How to Run

### Clone the Repository

```bash
git clone https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System.git
cd LIFEDROP-A-Blood-Donation-Intermediary-System
```

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
```bash
Create a .env file with your database URI, JWT secret, admin credentials and email credentials.
```

### Run the Server
```bash
npm start
```

### Open the Application
```bash
Visit http://localhost:3000 in your browser.
```

---

## 📸 Screenshots

Below are preview images of the LIFEDROP-A-Blood-Donation-Intermediary-System (A web-based Platform).

### Home Page
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Homepage.png)
### Emergency Form

<p align="center">
  <img src="https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Emergency%20form.png" width="500">
</p>

### Respomd to Emergency
 ![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Emergency%20Request.png) 
### Why Donate Blood
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Why%20Donate%20Blood.png)
### Blood Donate Compatibility
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Blood%20Donate%20Compatibility.png)
### Donation Process
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Donation%20Process.png)
### Leaflet Integration
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Leoflet%20Integration.png)
### Donor Registration
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Donor%20Registration.png)
### Donor Login
| ![withpassword](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Donor%20Login%20with%20Password.png) | ![withotp](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Donor%20Login%20with%20OTP.png) |
|-------------------------|-------------------------|
### Donor Dashboard
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Donor%20Dashboard%201.png)
### Donor Appointment Form
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Donor%20Appointment%20Form.png)
### Bloodbank Registration / Login
| ![registration](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Bloodbank%20Registration.png) | ![login](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Bloodbank%20Login.png) |
|-------------------------|-------------------------|
### Bloodbank Dashboard
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Bloodbank%20Dashboard.png)
### Bloodbank - Add Donation Record
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Bloodbank%20Add%20Donation%20Record.png)
### Admin Dashboard
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Admin%20dashboard.png)
### Admin Dashboard - Bloodbank Pending Approval
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Admin%20Dashboard%20%20-%20Bloodbank%20Pending%20Approval.png)
### Admin - Emergency Requests
![](https://github.com/Braham012/LIFEDROP-A-Blood-Donation-Intermediary-System/blob/main/Screenshots/Admin%20Dashboard%20%20-%20All%20Emergency%20Request.png)
