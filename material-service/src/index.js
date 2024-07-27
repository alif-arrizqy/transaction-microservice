const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("../src/config/config");
const materialRoutes = require("../src/routes/materialRoutes");
const MessageSubscriber = require("../src/messaging/subscriber");

require("dotenv").config();

const subscriber = new MessageSubscriber();

const app = express();
app.use(bodyParser.json());

app.use("/materials", materialRoutes);

const PORT = process.env.PORT || 3003;

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
