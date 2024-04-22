import { imageUpload } from "../utils/uploadImage.js";
import { prisma } from "../prisma/prisma.js";

export const getItems = async (req, res) => {
  try {
    const { type, usage } = req.query;
    let filterOptions = {
      where: {
        userId: req.userId,
      },
    };

    if (type) {
      filterOptions = {
        where: {
          AND: [
            {
              type: type.toUpperCase(),
            },
            {
              userId: req.userId,
            },
          ],
        },
      };
    }

    const clothes = await prisma.item.findMany({
      ...filterOptions,
      orderBy: usage ? { usage } : { datePurchased: "desc" },
    });

    return res.status(200).json(clothes);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};

export const addItem = async (req, res) => {
  try {
    const { brand, type, colour, datePurchased, userId } = req.body;
    if (
      !brand ||
      !type ||
      !datePurchased ||
      !colour ||
      !userId ||
      !req?.file?.filename
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const url = await imageUpload(req.file.path);
    const item = await prisma.item.create({
      data: {
        brand,
        colour,
        datePurchased,
        type: type.toUpperCase(),
        image: url,
        User: {
          connect: {
            id: userId,
          },
        },
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
    const item = await prisma.item.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
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
