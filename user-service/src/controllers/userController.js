const User = require("../models/User");
const ResponseHelper = require("../response/response");

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(ResponseHelper.success(user));
  } catch (error) {
    res.status(400).json(ResponseHelper.error(`${error.message}`, 400));
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(ResponseHelper.success(users));
  } catch (error) {
    res.status(400).json(ResponseHelper.error(`${error.message}`, 400));
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.status(200).json(ResponseHelper.success(user));
    } else {
      res.status(404).json(ResponseHelper.error("User not found", 404));
    }
  } catch (error) {
    res.status(400).json(ResponseHelper.error(`${error.message}`, 400));
  }
};

exports.updateUser = async (req, res) => {
  try {
    const isExist = await User.findByPk(req.params.id);
    if (isExist) {
      await User.update(req.body, { where: { id: req.params.id } });
      res.status(200).json(ResponseHelper.successMessage("User updated", 200));
    } else {
      res.status(404).json(ResponseHelper.error("User not found", 404));
    }
  } catch (error) {
    res.status(400).json(ResponseHelper.error(`${error.message}`, 400));
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const isExist = await User.findByPk(req.params.id);
    if (isExist) {
      await User.destroy({ where: { id: req.params.id } });
      res.status(204).json(ResponseHelper.successMessage("User deleted", 204));
    } else {
      res.status(404).json(ResponseHelper.error("User not found", 404));
    }
  } catch (error) {
    res.status(400).json(ResponseHelper.error(`${error.message}`, 400));
  }
};
