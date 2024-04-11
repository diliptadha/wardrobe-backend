import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { editUser, login, register } from "./controllers/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to application.",
    status: 200,
  });
});

app.post("/register", register);
app.post("/login", login);
app.put("/edit/user/:id", editUser);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}.`);
});

app.use((req, res, next) => {
  res.status(404).json({
    message: "404 not found path",
  });
});
