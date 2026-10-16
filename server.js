//import express from "express";
//var express = require("express");
//var app = express();
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import mongoose from "mongoose";
import app from "./server/express.js";
import router from "./server/assets-router.js";
//const assetsRouter = require("./server/assets-router");
import contactRoutes from "./routes/contact.routes.js";
import projectRoutes from "./routes/project.routes.js";
import qualificationRoutes from "./routes/qualification.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { validateJwtConfiguration } from "./middleware/authenticate.js";
import userRoutes from "./routes/user.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
validateJwtConfiguration();

app.use("/src", router);
app.use("/api/contacts", contactRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/qualifications", qualificationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/", function (req, res) {
  res.send({ message: "Welcome to My Portfolio Application" });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB database: Portfolio"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port " + (process.env.PORT || 3000));
});
console.log("Server running at http://localhost:3000/");
console.log(process.env.MONGODB_URI);
//module.exports = app;
export default app;
