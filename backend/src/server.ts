import app from "./app";
import dotenv from "dotenv";
dotenv.config();
import { connectDB, sequelize } from "@config/database";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await sequelize.sync(); // creates tables automatically
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
