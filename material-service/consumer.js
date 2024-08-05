const amqp = require("amqplib");

const EXCHANGE_MATERIAL = "exchange_material";
const QUEUE_MATERIAL = "queue_material_response";
const connectionString = "amqp://localhost";

async function start() {
  const connection = await amqp.connect(connectionString);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_MATERIAL, "direct");
  await channel.assertQueue(QUEUE_MATERIAL, {
    arguments: { "x-queue-type": "quorum" }
  });
  await channel.bindQueue(QUEUE_MATERIAL, EXCHANGE_MATERIAL, "");

  channel.consume(QUEUE_MATERIAL, (msg) => {
    if (msg !== null) {
      const request = JSON.parse(msg.content.toString());
      // const materialData = { materialId: request.materialId, type: "Wood" }; // Simulated material data
      const materialData = {
        materialId: request.materialId,
        type: request.type,
        price: request.price,
      };
      
      channel.publish(
        EXCHANGE_MATERIAL,
        "",
        Buffer.from(JSON.stringify(materialData))
      );
      channel.ack(msg);
    }
  });

  console.log("Material Service started");
}

start().catch(console.error);
