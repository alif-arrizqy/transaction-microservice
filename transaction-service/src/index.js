const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("../src/config/config");
const transactionRoutes = require("../src/routes/transactionRoutes");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.use("/transactions", transactionRoutes);

const PORT = process.env.PORT || 3002;

sequelize
  .sync()
  .then(() => {
    app.listen(`${PORT}`, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
