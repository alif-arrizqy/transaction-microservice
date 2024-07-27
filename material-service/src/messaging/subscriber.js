const amqp = require("amqplib");
const Material = require("../models/Material");
const { publishMessage } = require("../messaging/publisher");
const EventEmitter = require("events");

const queue = "material-service";

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
          // getMaterialById(data);
          const material = await Material.findByPk(data);
          if (!material) {
            publishMessage(
              "trans-material-service",
              JSON.stringify({ error: "Material not found" })
            );
          } else {
            console.log(`Material: ${material.materialName}`);
            publishMessage(
              "trans-material-service",
              JSON.stringify(material.materialName)
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
