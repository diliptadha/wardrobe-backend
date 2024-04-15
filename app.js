import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { editUser, login, register } from "./controllers/auth.js";
import {
  getItemsByType,
  addItem,
  deleteItem,
  editItem,
} from "./controllers/clothes.js";
import multer from "multer";
import { basename, extname } from "path";

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const extension = extname(file.originalname);
    const bn = basename(file.originalname, extension).replace(/\s+/g, "-");
    const randomName = Array(4)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join("");
    cb(null, `${bn}-${randomName}${extension}`);
  },
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
});

const upload = multer({ storage: storage });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("./uploads"));

app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to application.",
    status: 200,
  });
});

app.post("/register", register);
app.post("/login", login);
app.put("/edit/user/:id", editUser);
app.get("/item", getItemsByType);
app.post("/item", upload.single("image"), addItem);
app.delete("/item/:id", deleteItem);
app.put("/item/:id", upload.single("image"), editItem);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}.`);
});

app.use((req, res, next) => {
  res.status(404).json({
    message: "404 not found path",
  });
});
