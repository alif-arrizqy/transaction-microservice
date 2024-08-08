const amqp = require("amqplib");

async function publishMessage(msg) {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchangeTransaction = "exchange_transaction";
    const routingKey = "queue_user_response";
    const queueResponse = "queue_user_response";

    // create exchange user
    await channel.assertExchange(exchangeTransaction, "direct");

    // create queueResponse
    await channel.assertQueue(queueResponse, {
      arguments: { "x-queue-type": "quorum" },
    });

    // bind queueResponse to exchange
    await channel.bindQueue(queueResponse, exchangeTransaction, routingKey);

    // publish message to exchange
    console.log("user-service sent result %s", msg);
    channel.publish(exchangeTransaction, routingKey, Buffer.from(msg));

  } catch (error) {
    console.error("Error in publisher:", error);
  }
}

module.exports = { publishMessage };
