import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import layersRoutes from "./api/layers/layers.routes.js";
import listEndPoints from "express-list-endpoints";

const mongoUri = process.env.MONGO_URI;

try {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("MongoDB connection error:", error);
  process.exit(1);
}

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/users", userRoutes);
app.use("/layers", layersRoutes);

const endpoints = listEndPoints(app);

app.get("/", (_req, res) => {
  res.json({
    message: "Hello History!",
    endpoints,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
