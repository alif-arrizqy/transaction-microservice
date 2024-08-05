const amqp = require("amqplib");

const QUEUE_USER = "queue_user_response";
const QUEUE_MATERIAL = "queue_material_response";

let userData = null;
let materialData = null;

const pendingMessages = {
  user: null,
  material: null,
};

async function start() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_USER);
  await channel.assertQueue(QUEUE_MATERIAL);

  // Konsumer untuk data user
  channel.consume(QUEUE_USER, (msg) => {
    if (msg !== null) {
      handleUserMessage(msg, channel);
    }
  });

  // Konsumer untuk data material
  channel.consume(QUEUE_MATERIAL, (msg) => {
    if (msg !== null) {
      handleMaterialMessage(msg, channel);
    }
  });

  console.log("Transaction Service started");
}

function handleUserMessage(msg, channel) {
  console.log("Received user message:", msg.content.toString());
  userData = JSON.parse(msg.content.toString());
  pendingMessages.user = msg;
  processIfReady(channel);
}

function handleMaterialMessage(msg, channel) {
  console.log("Received material message:", msg.content.toString());
  materialData = JSON.parse(msg.content.toString());
  pendingMessages.material = msg;
  processIfReady(channel);
}

function processIfReady(channel) {
  if (userData && materialData) {
    const mergedData = mergeData(userData, materialData);
    sendFinalResponse(mergedData);
    acknowledgeMessages(channel);
  }
}

function mergeData(userData, materialData) {
  return { ...userData, ...materialData };
}

function sendFinalResponse(mergedData) {
  console.log("Sending final merged data:", mergedData);
  // Implement logic to send the merged data to the desired destination
}

function acknowledgeMessages(channel) {
  console.log("Acknowledging messages...");
  if (pendingMessages.user) {
    channel.ack(pendingMessages.user);
    pendingMessages.user = null;
  }
  if (pendingMessages.material) {
    channel.ack(pendingMessages.material);
    pendingMessages.material = null;
  }
}

start().catch(console.error);
