const mongoose = require("mongoose");

const dburl = process.env.DBURL;

async function dbconnection() {
  try {
    await mongoose.connect(dburl);
    console.log("Database Connected");
  } catch (error) {
    console.log("Error connecting to Database", error);
  }
}

module.exports = { dbconnection };
