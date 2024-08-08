const amqp = require("amqplib");
const User = require("../models/User");
const { publishMessage } = require("../messaging/publisher");
const EventEmitter = require("events");

const exchange = "exchange_user";
const queueRequest = "queue_user_request";
const routingKey = "queue_user_response";

class MessageSubscriber extends EventEmitter {
  async subscribeMessages() {
    try {
      // create connection to RabbitMQ server
      const connection = await amqp.connect("amqp://localhost");
      const channel = await connection.createChannel();

      // create exchange user
      await channel.assertExchange(exchange, "direct");

      // create queueRequest
      await channel.assertQueue(queueRequest, {
        arguments: { "x-queue-type": "quorum" },
      });
      
      // bind queueRequest to exchange
      await channel.bindQueue(queueRequest, exchange, routingKey);

      // consume message from queueRequest
      channel.consume(queueRequest, async (msg) => {
        if (msg !== null) {
          const userData = JSON.parse(msg.content.toString());
          const vendor = await User.findByPk(userData.vendorId);
          const customer = await User.findByPk(userData.customerId);

          let response = {};

          if (!vendor) {
            response.vendor = { error: "Vendor not found" };
            console.log("Vendor not found");
          } else {
            response.vendor = vendor.userName;
            console.log("Vendor:", vendor.userName);
          }

          if (!customer) {
            response.customer = { error: "Customer not found" };
            console.log("Customer not found");
          } else {
            response.customer = customer.userName;
            console.log("Customer:", customer.userName);
          }

          // Publish message
          console.log("Response:", response);
          publishMessage(JSON.stringify(response));

          channel.ack(msg);
        }
      });
    } catch (error) {
      console.error("Error in subscriber:", error);
    }
  }
}

module.exports = MessageSubscriber;
