const amqp = require("amqplib");

async function publishMessage(queue, msg) {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: false });

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log("material-service sent %s", msg);
  } catch (error) {
    console.error("Error in publisher:", error);
  }
}

module.exports = { publishMessage };
