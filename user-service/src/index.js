const bodyParser = require("body-parser");
const express = require("express");
const sequelize = require("../src/config/config");
const dotenv = require("dotenv");
const userRoutes = require("../src/routes/userRoutes");
const MessageSubscriber = require("../src/messaging/subscriber");

const subscriber = new MessageSubscriber();

const app = express();
dotenv.config();

app.use(bodyParser.json());

app.use("/users", userRoutes);

const PORT = process.env.PORT || 3001;

sequelize
  .sync()
  .then(() => {
    app.listen(`${PORT}`, () => {
      subscriber.subscribeMessages();
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });