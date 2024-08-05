const amqp = require("amqplib");

const EXCHANGE_USER = "exchange_user";
const QUEUE_USER = "queue_user_response";
const connectionString = "amqp://localhost";

async function start() {
  const connection = await amqp.connect(connectionString);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_USER, "direct");
  await channel.assertQueue(QUEUE_USER, {
    arguments: { "x-queue-type": "quorum" },
  });;
  await channel.bindQueue(QUEUE_USER, EXCHANGE_USER, "");

  channel.consume(QUEUE_USER, (msg) => {
    if (msg !== null) {
      const request = JSON.parse(msg.content.toString());
      // const userData = { userId: request.userId, name: "John Doe" }; // Simulated user data
      const userData = {
        userId: request.userId,
        name: request.name,
        email: request.email,
      };

      channel.publish(
        EXCHANGE_USER,
        "",
        Buffer.from(JSON.stringify(userData))
      );
      channel.ack(msg);
    }
  });

  console.log("User Service started");
}

start().catch(console.error);
