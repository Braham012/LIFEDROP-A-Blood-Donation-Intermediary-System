const { Emergency } = require("../emergency form/model");
const { user } = require("../../donorauthentication/model/model");
const geolib = require("geolib");
const { sendMessage } = require("../../utilis/whatsappsms");

async function emergencyrequest(req, res) {
  try {
    const {
      name,
      age,
      contact,
      email,
      bloodgroup,
      address,
      coordinates,
      needwithin,
    } = req.body;

    const emergency = await Emergency.create({
      name,
      age,
      contact,
      email,
      bloodgroup,
      address,
      coordinates,
      needwithin,
    });

    await emergency.save();

    res.status(201).json({
      message: "Emergency requested",
    });

    // 2️⃣ Extract emergency coordinates "lat,lng"
    const [eLat, eLng] = coordinates.split(",").map(Number);

    // 3️⃣ Fetch all verified donors
    const donors = await user.find({ verified: true });

    const nearbyDonors = [];

    for (let d of donors) {
      if (!d.address) continue;

      // donor.address = "lat,lng"
      const donorCoord = d.address.split(",");
      if (donorCoord.length !== 2) continue;

      const [dLat, dLng] = donorCoord.map(Number);

      // 4️⃣ Calculate distance using geolib (NO math)
      const distance = geolib.getDistance(
        { latitude: eLat, longitude: eLng },
        { latitude: dLat, longitude: dLng }
      );

      if (distance <= 15000) {
        nearbyDonors.push(d);
      }
    }

    for (let donor of nearbyDonors) {
      try {
        await sendMessage(
          donor.phonenumber,
          `🚨*Emergency Blood Request*🚨
A person nearby urgently needs *${bloodgroup}* blood.
 
📍 Location: ${address}
📞 Contact: ${contact}
⏱ Needed within: ${needwithin}

If you can help, please respond immediately.`
        );
      } catch (err) {
        console.log("WhatsApp sending failed:", donor.phonenumber, err);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to process emergency request",
      error: err.message,
    });
  }
}

module.exports = { emergencyrequest };
