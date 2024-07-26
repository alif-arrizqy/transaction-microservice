const amqp = require("amqplib/callback_api");
const Transaction = require("../models/Transaction");

const publishToExchange = (exchange, message) => {
  amqp.connect("amqp://localhost", (err, connection) => {
    if (err) {
      throw err;
    }
    connection.createChannel((err, channel) => {
      if (err) {
        throw err;
      }
      channel.assertExchange(exchange, "direct", { durable: false });
      channel.publish(exchange, "", Buffer.from(message));
      console.log(
        `Transaction - Message sent to exchange ${exchange}: ${message}`
      );
    });
  });
};

exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    publishToExchange("transaction_exchange", JSON.stringify(transaction));
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
