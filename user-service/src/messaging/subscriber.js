const amqp = require("amqplib");
const User = require("../models/User");
const { publishMessage } = require("../messaging/publisher");
const EventEmitter = require("events");

const queue = "user-service";

class MessageSubscriber extends EventEmitter {
  async subscribeMessages() {
    try {
      const connection = await amqp.connect("amqp://localhost");
      const channel = await connection.createChannel();

      await channel.assertQueue(queue, { durable: false });
      channel.consume(
        queue,
        async (msg) => {
          const data = JSON.parse(msg.content.toString());
          // getUserById(data);
          const vendor = await User.findByPk(data.vendorId);
          const customer = await User.findByPk(data.customerId);

          if (!vendor) {
            publishMessage(
              "trans-user-service",
              JSON.stringify({ error: "Vendor not found" })
            );
          } else if (!customer) {
            publishMessage(
              "trans-user-service",
              JSON.stringify({ error: "Customer not found" })
            );
          } else {
            publishMessage(
              "trans-user-service",
              JSON.stringify({
                vendor: vendor.userName,
                customer: customer.userName,
              })
            );
          }
        },
        { noAck: true }
      );
    } catch (error) {
      console.error("Error in subscriber:", error);
    }
  }
}

module.exports = MessageSubscriber;
