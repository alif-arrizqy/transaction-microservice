const amqp = require("amqplib/callback_api");
const User = require("../models/User");

const publishToExchange = (exchange, routingKey, message) => {
  amqp.connect("amqp://localhost", (err, connection) => {
    if (err) {
      throw err;
    }
    connection.createChannel((err, channel) => {
      if (err) {
        throw err;
      }
      channel.assertExchange(exchange, "direct", { durable: false });
      channel.publish(exchange, routingKey, Buffer.from(message));
      console.log(`User - Message sent to exchange ${exchange}: ${message}`);
    });
  });
};

const RABBITMQ_URL = "amqp://localhost";
const EXCHANGE = "transaction_exchange";
const QUEUE = "user_transaction_queue";

const consumeFromExchange = (exchange, queue, routingKey, callback) => {
  amqp.connect(RABBITMQ_URL, (err, connection) => {
    if (err) {
      throw err;
    }
    connection.createChannel((err, channel) => {
      if (err) {
        throw err;
      }
      channel.assertExchange(exchange, "direct", { durable: false }); // Use 'direct' instead of 'fanout'
      channel.assertQueue(queue, { durable: false }, (err, q) => {
        if (err) {
          throw err;
        }
        channel.bindQueue(q.queue, exchange, routingKey);
        channel.consume(q.queue, (msg) => {
          if (msg !== null) {
            console.log(
              `User - Message received from exchange ${exchange}: ${msg.content.toString()}`
            );
            callback(JSON.parse(msg.content.toString()));
            channel.ack(msg);
          }
        });
      });
    });
  });
};

// Consume message from transaction_exchange
consumeFromExchange(EXCHANGE, QUEUE, "", (transaction) => {
  // RoutingKey is '' for direct exchange
  console.log("New transaction created:", transaction);
  // Handle the transaction_created event
});

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    publishToExchange("user_exchange", "user.created", JSON.stringify(user));
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const [updated] = await User.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedUser = await User.findByPk(req.params.id);
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
