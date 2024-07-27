const amqp = require("amqplib");
const EventEmitter = require("events");

class MessageSubscriber extends EventEmitter {
  constructor(queues) {
    super();
    this.queues = queues;
  }

  async subscribeMessages() {
    try {
      const connection = await amqp.connect("amqp://localhost");
      const channel = await connection.createChannel();

      for (const queue of this.queues) {
        await channel.assertQueue(queue, { durable: false });
        channel.consume(
          queue,
          (msg) => {
            const data = JSON.parse(msg.content.toString());
            this.emit("message", { queue, data });
          },
          { noAck: true }
        );
      }
    } catch (error) {
      console.error("Error in subscriber:", error);
    }
  }
}

module.exports = MessageSubscriber;
