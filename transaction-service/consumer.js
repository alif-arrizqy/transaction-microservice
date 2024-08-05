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
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await assertQueues(channel);
    consumeMessages(channel);

    console.log("Transaction Service started");
  } catch (error) {
    console.error("Failed to start the service:", error);
  }
}

async function assertQueues(channel) {
  await channel.assertQueue(QUEUE_USER, {
    arguments: { "x-queue-type": "quorum" },
  });
  await channel.assertQueue(QUEUE_MATERIAL, {
    arguments: { "x-queue-type": "quorum" },
  });
}

function consumeMessages(channel) {
  channel.consume(QUEUE_USER, (msg) => handleUserMessage(msg, channel));
  channel.consume(QUEUE_MATERIAL, (msg) => handleMaterialMessage(msg, channel));
}

function handleUserMessage(msg, channel) {
  if (msg) {
    console.log("Received user message:", msg.content.toString());
    userData = JSON.parse(msg.content.toString());
    pendingMessages.user = msg;
    processIfReady(channel);
  }
}

function handleMaterialMessage(msg, channel) {
  if (msg) {
    console.log("Received material message:", msg.content.toString());
    materialData = JSON.parse(msg.content.toString());
    pendingMessages.material = msg;
    processIfReady(channel);
  }
}

function processIfReady(channel) {
  console.log("User data:", userData);
  console.log("Material data:", materialData);

  if (userData && materialData) {
    console.log("data lengkap");
    const mergedData = mergeData(userData, materialData);
    sendFinalResponse(mergedData);
    acknowledgeMessages(channel);
    resetData();
  } else {
    console.log("data belum lengkap");
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
  if (pendingMessages.user) {
    console.log("reset user");
    channel.ack(pendingMessages.user);
    pendingMessages.user = null;
  }
  if (pendingMessages.material) {
    channel.ack(pendingMessages.material);
    console.log("reset material");
    pendingMessages.material = null;
  }
}

function resetData() {
  userData = null;
  materialData = null;
}

start();
