import { prisma } from "../prisma/prisma.js";

export const getItemsByType = async (req, res) => {
  try {
    const { type } = req.query;
    if (!type) {
      return res.status(400).json({ message: "Type is required" });
    }
    const clothes = await prisma.item.findMany({
      where: {
        type,
      },
    });
    return res.status(200).json(clothes);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};

export const addItem = async (req, res) => {
  try {
    const { brand, type, colour, datePurchased } = req.body;
    if (!brand || !type || !datePurchased || !colour || !req?.file?.filename) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const item = await prisma.item.create({
      data: {
        brand,
        colour,
        datePurchased,
        type,
        image: req.file.filename,
      },
    });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Id is required" });
    }
    const item = await prisma.item.delete({
      where: {
        id,
      },
    });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};

export const editItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.item.update({
      where: {
        id,
      },
      data: {
        ...req.body,
        image: req?.file?.filename,
      },
    });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};
