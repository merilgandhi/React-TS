import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

interface ProductVariationAttributes {
    id: number;
    productId: number;
    variationId: number;
    price: number;
    productQrCode: string;
    boxQuantity: number;
    boxQrCode: string;
    stockInHand: number;
}

interface ProductVariationCreationAttributes
    extends Optional<ProductVariationAttributes, "id"> {}



export class ProductVariation
    extends Model<ProductVariationAttributes, ProductVariationCreationAttributes>
    implements ProductCreationAttributes    
    {
    public id!: number;
    public productId!: number;
    public variationId!: number;
    public price!: number
    public productQrCode!: string;
    public boxQuantity!: number;
    public boxQrCode!: string;
    public stockInHand!: number;
    }

ProductVariation.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        productId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        variationId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        productQrCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        boxQuantity: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        boxQrCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        stockInHand: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "product_variations",
        timestamps: true,
    }
);
export default ProductVariation;


