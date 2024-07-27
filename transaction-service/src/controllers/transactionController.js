const Transaction = require("../models/Transaction");
const { publishMessage } = require("../messaging/publisher");
const MessageSubscriber = require("../messaging/subscriber");
const ResponseHelper = require("../response/response");

// const subscriber = new MessageSubscriber();
const queues = ["trans-material-service", "trans-user-service"];
const subscriber = new MessageSubscriber(queues);

exports.createTransaction = async (req, res) => {
  let userServiceResponse = null;
  let materialServiceResponse = null;
  let responseSent = false;
  const TIMEOUT = 10000; // 10 seconds timeout

  try {
    // Publish message to user-service
    await publishMessage("user-service", JSON.stringify(req.body));
    // Publish message to material-service
    await publishMessage(
      "material-service",
      JSON.stringify(req.body.materialId)
    );

    // Subscribe to messages from both services
    await subscriber.subscribeMessages();

    // Event listener for user-service response
    const userServiceListener = (message) => {
      if (message.queue === "trans-user-service") {
        console.log("Received message from user-service:", message.data);
        userServiceResponse = message.data;
        checkAndSendResponse();
      }
    };

    // Event listener for material-service response
    const materialServiceListener = (message) => {
      if (message.queue === "trans-material-service") {
        console.log("Received message from material-service:", message.data);
        materialServiceResponse = message.data;
        checkAndSendResponse();
      }
    };

    // Attach event listeners
    subscriber.on("message", userServiceListener);
    subscriber.on("message", materialServiceListener);

    // Function to check if both responses are received and send the response
    const checkAndSendResponse = () => {
      if (userServiceResponse && materialServiceResponse && !responseSent) {
        console.log("Both responses received, sending response");

        // Save transaction to database
        Transaction.create({
          vendorId: req.body.vendorId,
          customerId: req.body.customerId,
          materialId: req.body.materialId,
          transactionDate: req.body.transactionDate,
        });

        res.status(201).json({
          statusCode: 201,
          message: "Transaction created successfully",
          data: {
            vendor: userServiceResponse.vendor,
            customer: userServiceResponse.customer,
            material: materialServiceResponse,
            transactionDate: req.body.transactionDate
          }
        });
        responseSent = true;

        // Clean up event listeners
        subscriber.off("message", userServiceListener);
        subscriber.off("message", materialServiceListener);
      }
    };

    // Set a timeout to handle delays
    setTimeout(() => {
      if (!responseSent) {
        console.log("Timeout reached, sending partial response");
        res.status(200).json({
          statusCode: 200,
          message: "Transaction created with partial responses",
          data: {
            vendor: userServiceResponse ? userServiceResponse.vendor : null,
            customer: userServiceResponse ? userServiceResponse.customer : null,
            material: materialServiceResponse ? materialServiceResponse : null,
            transactionDate: req.body.transactionDate
          }
        });
        responseSent = true;

        // Clean up event listeners
        subscriber.off("message", userServiceListener);
        subscriber.off("message", materialServiceListener);
      }
    }, TIMEOUT);

  } catch (error) {
    if (!responseSent) {
      res.status(400).json({ error: error.message });
      responseSent = true;
    }
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.status(200).json(ResponseHelper.success(transactions));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (transaction) {
      res.status(200).json(ResponseHelper.success(transaction));
    } else {
      res.status(404).json(ResponseHelper.error("Transaction not found", 404));
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

exports.updateTransaction = async (req, res) => {
  try {
    const isExist = await Transaction.findByPk(req.params.id);
    if (isExist) {
      await Transaction.update(req.body, { where: { id: req.params.id } });
      res.status(200).json(ResponseHelper.successMessage("Transaction updated", 200));
    } else {
      res.status(404).json(ResponseHelper.error("Transaction not found", 404));
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

exports.deleteTransaction = async (req, res) => {
  try {
    const isExist = await Transaction.findByPk(req.params.id);
    if (isExist) {
      await Transaction.destroy({ where: { id: req.params.id } });
      res.status(204).json(ResponseHelper.successMessage("Transaction deleted", 204));
    } else {
      res.status(404).json(ResponseHelper.error("Transaction not found", 404));
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
