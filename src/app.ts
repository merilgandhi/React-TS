import express from "express";
import userRoutes from "@routes/userRoutes";
import cors from "cors";
import cookieParser from "cookie-parser";
import variation from "@routes/variationRoutes";
import productRoutes from "@routes/productRoutes";
import sellerRoutes from "@routes/sellerRoutes";
import { swaggerSpec, swaggerUiMiddleware } from "@config/swagger";

const app = express();

const corsOptions = {
    origin: ['http://localhost:5174', 'http://localhost:5173'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/api-docs", swaggerUiMiddleware.serve, swaggerUiMiddleware.setup(swaggerSpec));
 

app.use("/api", userRoutes);
app.use("/api/variations", variation);   
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);





export default app;
