import { DataTypes } from "sequelize";
import sequelize from "../config/database";
import Quotation from "./Quotation";

const Revision = sequelize.define("Revision", {
  quotationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Quotation,
      key: "id",
    },
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Revision;
