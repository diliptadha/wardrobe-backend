import { imageUpload } from "../lib/uploadImage.js";
import { prisma } from "../prisma/prisma.js";

export const getItems = async (req, res) => {
  try {
    const { type, sort } = req.query;
    let filterOptions = {};

    if (type) {
      filterOptions = {
        where: {
          type: type.toUpperCase(), // Assuming type values are stored in uppercase in your database
        },
      };
    }

    const clothes = await prisma.item.findMany({
      ...filterOptions,
      orderBy: sort ? { usage: sort } : { createdAt: "desc" },
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
    const url = await imageUpload(req.file.path);
    const item = await prisma.item.create({
      data: {
        brand,
        colour,
        datePurchased,
        type,
        image: url,
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
    const { usage, ...otherData } = req.body;

    const updatedData = {
      ...otherData,
      usage: usage !== undefined ? Number(usage) : undefined,
    };
    if (req.file) {
      const url = await imageUpload(req.file.path);
      updatedData.image = url;
    }

    const item = await prisma.item.update({
      where: {
        id,
      },
      data: updatedData,
    });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};
