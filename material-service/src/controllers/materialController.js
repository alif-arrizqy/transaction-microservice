const amqp = require("amqplib/callback_api");
const Material = require("../models/Material");

const publishToExchange = (exchange, routingKey, message) => {
  amqp.connect("amqp://localhost", (err, connection) => {
    if (err) {
      throw err;
    }
    connection.createChannel((err, channel) => {
      if (err) {
        throw err;
      }
      channel.assertExchange(exchange, "direct", { durable: false });
      channel.publish(exchange, routingKey, Buffer.from(message));
      console.log(
        `Material - Message sent to exchange ${exchange}: ${message}`
      );
    });
  });
};

const RABBITMQ_URL = "amqp://localhost";
const EXCHANGE = "transaction_exchange";
const QUEUE = "material_transaction_queue";

const consumeFromExchange = (exchange, queue, callback) => {
  amqp.connect(RABBITMQ_URL, (err, connection) => {
    if (err) {
      throw err;
    }
    connection.createChannel((err, channel) => {
      if (err) {
        throw err;
      }
      channel.assertExchange(exchange, "direct", { durable: false });
      channel.assertQueue(queue, { durable: false }, (err, q) => {
        if (err) {
          throw err;
        }
        channel.bindQueue(q.queue, exchange, "");
        channel.consume(q.queue, (msg) => {
          if (msg !== null) {
            console.log(
              `Material - Message received from exchange ${exchange}: ${msg.content.toString()}`
            );
            callback(JSON.parse(msg.content.toString()));
            channel.ack(msg);
          }
        });
      });
    });
  });
};

// Consume message from transaction_exchange
consumeFromExchange(EXCHANGE, QUEUE, (transaction) => {
  console.log("New transaction created:", transaction);
  // Handle the transaction_created event
});

exports.createMaterial = async (req, res) => {
  try {
    const material = await Material.create(req.body);
    publishToExchange(
      "material_exchange",
      "material.created",
      JSON.stringify(material)
    );
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.findAll();
    res.status(200).json(materials);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
