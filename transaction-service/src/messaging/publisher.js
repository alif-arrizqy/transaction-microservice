const amqp = require("amqplib");

async function publishMessage(queue, msg) {
  console.log("queue:", queue);
  console.log("msg:", msg);
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    
    // send message to queue
    channel.sendToQueue(queue, Buffer.from(msg));
  } catch (error) {
    console.error("Error in publisher:", error);
  }
}

module.exports = { publishMessage };
