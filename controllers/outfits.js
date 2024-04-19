import { prisma } from "../prisma/prisma.js";

export const addOutfits = async (req, res) => {
  try {
    const { userId, itemIds } = req.body;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const outfit = await prisma.outfit.create({
      data: {
        items: {
          connect: itemIds.map((itemId) => ({ id: itemId })),
        },
        userId,
      },
    });
    return res.status(200).json(outfit);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};

export const getAllOutfit = async (req, res) => {
  try {
    const outfits = await prisma.outfit.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        log: true,
        logDate: true,
        items: {
          select: {
            type: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const transformedData = outfits.map((outfit) => {
      const { id, log, items, logDate } = outfit;
      let transformedItems = {};
      items.forEach((item) => {
        transformedItems[item.type.toLowerCase()] = item.image;
      });

      return { id, log, logDate, ...transformedItems };
    });

    return res.status(200).json(transformedData);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};

export const deleteOutfit = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Id is required" });
    }
    const deletedOutfit = await prisma.outfit.delete({
      where: {
        id,
      },
    });
    await prisma.$transaction(
      deletedOutfit.itemsIds.map((id) =>
        prisma.item.update({
          where: { id },
          data: {
            outfits: {
              disconnect: { id },
            },
          },
        })
      )
    );

    return res.status(200).json(deletedOutfit);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};

export const editOutfit = async (req, res) => {
  try {
    const { id } = req.params;
    const { log, logDate } = req.body;
    if (!log || !logDate) {
      return res.status(400).json({ message: "log and logDate are required" });
    }
    const updatedOutfit = await prisma.outfit.update({
      where: {
        id,
      },
      data: {
        log,
        logDate,
      },
    });
    return res.status(200).json(updatedOutfit);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};
