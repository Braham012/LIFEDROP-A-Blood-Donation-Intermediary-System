const express = require("express");
require("dotenv").config({ path: "./../MAJOR PROJECT/backend/.env" });
const { dbconnection } = require("./utilis/db");
const { Donorrouter } = require("./donorauthentication/router/routes");
const { Adminrouter } = require("./admin authentication/router/routes");
const { bloodbankroute } = require("./bloodbankauthentication/router/routes");
const { emergencyrequest } = require("./services/emergency form/controller");
const { appointmentrouter } = require("./services/appointment form/routes");
const { recordrouter } = require("./services/donationrecord form/routes");
const { submitrouter } = require("./services/getintouch form/route");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const port = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5500", credentials: true }));

dbconnection();

app.use("/donor", Donorrouter);
app.use("/admin", Adminrouter);
app.use("/bloodbank", bloodbankroute);
app.use("/emergency", emergencyrequest);
app.use("/appointment", appointmentrouter);
app.use("/donation", recordrouter);
app.use("/feedback", submitrouter);

app.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});
