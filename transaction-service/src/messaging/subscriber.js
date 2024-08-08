const amqp = require("amqplib");
const EventEmitter = require("events");

class MessageSubscriber extends EventEmitter {
  constructor() {
    super();
    this.QUEUE_USER = "queue_user_response";
    this.QUEUE_MATERIAL = "queue_material_response";
    this.userData = null;
    this.materialData = null;

    this.pendingMessages = {
      user: null,
      material: null,
    };
  }

  async subscribeMessages() {
    try {
      const connection = await amqp.connect("amqp://localhost");
      const channel = await connection.createChannel();

      this.consumeMessage(channel);
    } catch (error) {
      console.error("Error in subscriber:", error);
    }
  }

  consumeMessage(channel) {
    channel.consume(this.QUEUE_USER, (msg) => {
      try {
        this.handleUserMessage(msg, channel);
      } catch (error) {
        console.error("Error handling user message:", error);
      }
    });

    channel.consume(this.QUEUE_MATERIAL, (msg) => {
      try {
        this.handleMaterialMessage(msg, channel);
      } catch (error) {
        console.error("Error handling material message:", error);
      }
    });
  }

  handleUserMessage(msg, channel) {
    if (msg) {
      console.log("Received user message:", msg.content.toString());
      this.userData = JSON.parse(msg.content.toString());
      this.pendingMessages.user = msg;
      this.processIfReady(channel);
    }
  }

  handleMaterialMessage(msg, channel) {
    if (msg) {
      console.log("Received material message:", msg.content.toString());
      this.materialData = JSON.parse(msg.content.toString());
      this.pendingMessages.material = msg;
      this.processIfReady(channel);
    }
  }

  processIfReady(channel) {
    console.log("User data:", this.userData);
    console.log("Material data:", this.materialData);

    if (this.userData && this.materialData) {
      console.log("data lengkap");
      const mergedData = { ...this.userData, ...this.materialData };
      console.log("Merged data:", mergedData);
      this.acknowledgeMessages(channel);
      this.resetData();

      this.emit("message", mergedData);
    } else {
      console.log("data belum lengkap");
    }
  }

  acknowledgeMessages(channel) {
    if (this.pendingMessages.user) {
      console.log("reset user");
      channel.ack(this.pendingMessages.user);
      this.pendingMessages.user = null;
    }
    if (this.pendingMessages.material) {
      console.log("reset material");
      channel.ack(this.pendingMessages.material);
      this.pendingMessages.material = null;
    }
  }

  resetData() {
    this.userData = null;
    this.materialData = null;
  }
}

module.exports = MessageSubscriber;
