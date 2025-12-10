const { ContactForm } = require("./model");

const submitContactForm = async (req, res) => {
  try {
    const { contactName, contactEmail, contactSubject, contactMessage } =
      req.body;

    if (!contactName || !contactEmail || !contactSubject || !contactMessage) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newContact = new ContactForm({
      name: contactName,
      email: contactEmail,
      subject: contactSubject,
      message: contactMessage,
    });

    await newContact.save();

    return res.status(201).json({
      success: true,
      message: "Message sent successfully! We will respond within 24 hours.",
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting form",
    });
  }
};

module.exports = { submitContactForm };
