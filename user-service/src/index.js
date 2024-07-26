const bodyParser = require("body-parser");
const express = require("express");
const sequelize = require("../src/config/config");
const dotenv = require("dotenv");
const userRoutes = require("../src/routes/userRoutes");

const app = express();
dotenv.config();

app.use(bodyParser.json());

app.use("/users", userRoutes);

const PORT = process.env.PORT || 3001;

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