const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Material = sequelize.define("Material", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  materialName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Material;
