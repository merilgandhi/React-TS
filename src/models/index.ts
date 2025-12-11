import User from "./User";
import Variation from "./Variation";
import Product from "./Product";
import ProductVariation from "./ProductVariation";





Variation.belongsTo(User, { as: "creator", foreignKey: "createdBy" });
User.hasMany(Variation, { as: "variations", foreignKey: "createdBy" });


Product.hasMany(ProductVariation, { as: "variants", foreignKey: "productId" });
ProductVariation.belongsTo(Product, { foreignKey: "productId" });


Variation.hasMany(ProductVariation, { foreignKey: "variationId" });
ProductVariation.belongsTo(Variation, { foreignKey: "variationId" });

User.hasMany(Product, { as: "products", foreignKey: "createdBy" });
Product.belongsTo(User, { as: "creator", foreignKey: "createdBy" });



export { User, Variation, Product, ProductVariation };
