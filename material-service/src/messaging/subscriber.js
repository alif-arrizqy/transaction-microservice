const amqp = require("amqplib");
const Material = require("../models/Material");
const { publishMessage } = require("../messaging/publisher");
const EventEmitter = require("events");

const exchange = "exchange_material";
const queueRequest = "queue_material_request";
const routingKey = "queue_material_request";

class MessageSubscriber extends EventEmitter {
  async subscribeMessages() {
    try {
      // create connection to RabbitMQ server
      const connection = await amqp.connect("amqp://localhost");
      const channel = await connection.createChannel();

      // create exchange material
      await channel.assertExchange(exchange, "direct");

      // create queue_request
      await channel.assertQueue(queueRequest, {
        arguments: { "x-queue-type": "quorum" },
      });

      // bind queue_request to exchange
      await channel.bindQueue(queueRequest, exchange, routingKey);

      // consume message from queue_request
      channel.consume(queueRequest, async (msg) => {
        if (msg !== null) {
          const material = JSON.parse(msg.content.toString());
          const result = await Material.findByPk(material.materialId);

          let response = {};

          if (!result) {
            console.log("Material not found");
            response.material = { error: "Material not found" };
          } else {
            console.log("Material:", result.materialName);
            response.material = result.materialName;
          }
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
