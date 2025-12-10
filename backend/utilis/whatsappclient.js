const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth(), // Stores session locally so you don’t scan QR every time
});

// Show QR code for first-time login
client.on("qr", (qr) => {
  console.log("Scan this QR code with your WhatsApp:");
  qrcode.generate(qr, { small: true });
});

// Client ready event
client.on("ready", () => {
  console.log(" WhatsApp client is ready!");
});

client.initialize();

module.exports = { client };
