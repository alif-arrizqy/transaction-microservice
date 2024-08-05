const amqp = require("amqplib");

async function publishMessages() {
  try {
    const connection = await amqp.connect("amqp://guest:guest@localhost:5672/");
    const channel = await connection.createChannel();

    // for (let i = 0; i < 10; i++) {
    //   channel.publish("notification", "sms", Buffer.from(`sms ${i}`), {
    //     headers: {
    //       sample: "value",
    //     },
    //   });
    // }

    // publish user
    const dataUser = {
      vendor: 1,
      customer: 2,
    };
    channel.publish("user", "users", Buffer.from(JSON.stringify(dataUser)));

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error in publishing messages:", error);
  }
}

publishMessages();
