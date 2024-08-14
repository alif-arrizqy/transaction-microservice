const Transaction = require("../models/Transaction");
const { publishMessage } = require("../messaging/publisher");
const MessageSubscriber = require("../messaging/subscriber");
const ResponseHelper = require("../response/response");

const queueUserRequest = "queue_user_request";
const queueMaterialRequest = "queue_material_request";

const subscriber = new MessageSubscriber();

exports.createTransaction = async (req, res) => {
  let responseSent = false;

  const msgUser = {
    vendorId: req.body.vendorId,
    customerId: req.body.customerId,
  };
  await publishMessage(queueUserRequest, JSON.stringify(msgUser));

  const msgMaterial = {
    materialId: req.body.materialId,
  };
  await publishMessage(queueMaterialRequest, JSON.stringify(msgMaterial));

  await subscriber.subscribeMessages();

  const handleMessage = async (data) => {
    try {
      // Error handling
      if (data.vendor.error && data.customer.error) {
        console.log("Vendor and Customer not found");
        res.status(400).json({ error: "Vendor and Customer not found" });
      } else if (data.vendor.error || data.customer.error) {
        console.log("Vendor or Customer not found");
        res
          .status(400)
          .json({ error: data.vendor.error || data.customer.error });
      } else if (data.material.error) {
        console.log("Material not found");
        res.status(400).json({ error: "Material not found" });
      } else {
        const transDate = new Date();
        const transactionDate = transDate.toISOString().split("T")[0];

        await Transaction.create({
          vendorId: req.body.vendorId,
          customerId: req.body.customerId,
          materialId: req.body.materialId,
          transactionDate: transactionDate,
        });

        console.log("Transaction created successfully");
        res.status(201).json({
          statusCode: 201,
          message: "Transaction created",
          data: {
            vendor: data.vendor,
            customer: data.customer,
            material: data.material,
          },
        });
      }
      responseSent = true;
    } catch (error) {
      if (!responseSent) {
        console.log("Error processing message:", error);
        res
          .status(500)
          .json(ResponseHelper.error("Internal server error", 500));
        responseSent = true;
      }
      console.log("Unsubscribing from messages");
      subscriber.off("message", handleMessage);
    } finally {
      console.log("Unsubscribing from messages");
      subscriber.off("message", handleMessage);
    }
  };

  subscriber.on("message", handleMessage);
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
};

exports.updateTransaction = async (req, res) => {
  try {
    const isExist = await Transaction.findByPk(req.params.id);
    if (isExist) {
      await Transaction.update(req.body, { where: { id: req.params.id } });
      res
        .status(200)
        .json(ResponseHelper.successMessage("Transaction updated", 200));
    } else {
      res.status(404).json(ResponseHelper.error("Transaction not found", 404));
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const isExist = await Transaction.findByPk(req.params.id);
    if (isExist) {
      await Transaction.destroy({ where: { id: req.params.id } });
      res
        .status(204)
        .json(ResponseHelper.successMessage("Transaction deleted", 204));
    } else {
      res.status(404).json(ResponseHelper.error("Transaction not found", 404));
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
