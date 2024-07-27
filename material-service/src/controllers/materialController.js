const Material = require("../models/Material");
const ResponseHelper = require("../response/response");

exports.createMaterial = async (req, res) => {
  try {
    const material = await Material.create(req.body);
    res.status(201).json(ResponseHelper.success(material));
  } catch (error) {
    res.status(400).json(ResponseHelper.error(`${error.message}`, 400));
  }
};

exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.findAll();
    res.status(200).json(ResponseHelper.success(materials));
  } catch (error) {
    res.status(400).json(ResponseHelper.error(`${error.message}`, 400));
  }
};

exports.getMaterial = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (material) {
      res.status(200).json(ResponseHelper.success(material));
    } else {
      res.status(404).json(ResponseHelper.error("Material not found", 404));
    }
  } catch (error) {
    res.status(400).json(ResponseHelper.error(`${error.message}`, 400));
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const isExist = await Material.findByPk(req.params.id);
    if (isExist) {
      await Material.update(req.body, { where: { id: req.params.id } });
      res.status(200).json(ResponseHelper.successMessage("Material updated", 200));
    } else {
      res.status(404).json(ResponseHelper.error("Material not found", 404));
    }
  } catch (error) {
    res.status(400).json(ResponseHelper.error(`${error.message}`, 400));
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const isExist = await Material.findByPk(req.params.id);
    if (isExist) {
      await Material.destroy({ where: { id: req.params.id } });
      res.status(204).json(ResponseHelper.successMessage("Material deleted", 204));
    } else {
      res.status(404).json(ResponseHelper.error("Material not found", 404));
    }
  } catch (error) {
    res.status(400).json(ResponseHelper.error(`${error.message}`, 400));
  }
};
