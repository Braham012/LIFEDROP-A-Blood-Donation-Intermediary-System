async function loadRequests() {
  const container = document.getElementById("requestList");

  try {
    const res = await fetch(
      "http://localhost:3100/admin/services/getallemergencyrequest"
    );

    const result = await res.json();

    if (!result.success) {
      container.innerHTML =
        "<p style='color:red;'>Failed to fetch requests</p>";
      return;
    }

    const requests = result.data;

    container.innerHTML = "";

    requests.forEach((req) => {
      const bloodgroup = req.bloodgroup;
      const name = req.name;
      const contact = req.contact;
      const address = req.address;
      const needwithin = req.needwithin;
      const createdAt = req.createdAt
        ? new Date(req.createdAt).toLocaleString()
        : "";

      container.innerHTML += `
        <div class="request-card">
          <h3 class="request-title">
            ${bloodgroup} Blood Needed
          </h3>

          <div class="request-details">
            <p><i class="fas fa-user"></i> Name: ${name}</p>
            <p><i class="fas fa-phone"></i> Contact: ${contact}</p>
            <p><i class="fas fa-map-marker-alt"></i> Address: ${address}</p>
            <p><i class="fas fa-clock"></i> Need Within: ${needwithin}</p>
            <p><i class="fas fa-clock"></i> Requested At: ${createdAt}</p>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='color:red;'>Error loading requests.</p>";
  }
}

loadRequests();
