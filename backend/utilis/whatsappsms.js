const { client } = require("./whatsappclient");

async function sendMessage(phoneNumber, message) {
  if (!client.info?.wid) {
    throw new Error("WhatsApp client is not ready yet!");
  }

  const cleanNumber = phoneNumber.replace(/\D/g, "");
  const chatId = `${cleanNumber}@c.us`;

  const isRegistered = await client.isRegisteredUser(chatId);
  if (!isRegistered) {
    throw new Error(`${phoneNumber} is not a WhatsApp user`);
  }

  await client.sendMessage(chatId, message);
  /*  console.log(`✅ Message sent to ${cleanNumber}`);  */
}

module.exports = { sendMessage };
