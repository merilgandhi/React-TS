import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

interface SellerAttributes {
  id: number;
  name: string;
  contactNumber: number;
  email?: string;
  deletedAt?: Date;
  isActive: boolean;
}

interface SellerCreationAttributes extends Optional<SellerAttributes, "id"> {}

export class Seller
  extends Model<SellerAttributes, SellerCreationAttributes>
  implements SellerAttributes
{
  public id!: number;
  public name!: string;
  public contactNumber!: number;
  public email?: string;
  public deletedAt?: Date;
  public isActive!: boolean;
}

Seller.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactNumber: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  { sequelize, 
    tableName: "sellers",
    hooks: {
      beforeCreate: (seller) => {
        if (seller.email) {
          seller.email = seller.email.toLowerCase();
        } 
      },
      beforeUpdate: (seller) => {
        if (seller.email) {
          seller.email = seller.email.toLowerCase();
        } 
      },
    },  
    timestamps: true,
    paranoid: true
   }
);


export default Seller;