const amqp = require("amqplib");

async function publishMessages() {
  try {
    const connection = await amqp.connect("amqp://guest:guest@localhost:5672/");
    const channel = await connection.createChannel();

    // publish material
    const dataMaterial = { material: 1 };
    channel.publish(
      "material",
      "materials",
      Buffer.from(JSON.stringify(dataMaterial))
    );

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error in publishing messages:", error);
  }
}

publishMessages();

