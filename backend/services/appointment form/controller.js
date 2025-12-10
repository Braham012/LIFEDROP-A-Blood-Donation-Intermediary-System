const { Appointment } = require("./model");

const addAppointment = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      bloodType,
      preferredDate,
      preferredTime,
      location,
      message,
      firstTimeDonor,
    } = req.body;

    const newAppointment = new Appointment({
      firstName,
      lastName,
      email,
      phone,
      bloodType,
      preferredDate,
      preferredTime,
      location,
      message,
      firstTimeDonor,
    });

    const savedAppointment = await newAppointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment: savedAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: error.message,
    });
  }
};

module.exports = {
  addAppointment,
};
