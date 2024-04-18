import { prisma } from "../prisma/prisma.js";

export const addOutfits = async (req, res) => {
  try {
    const updatedOutfit = await prisma.outfit.create({
      data: {
        items: {
          connect: req.body.itemIds.map((itemId) => ({ id: itemId })),
        },
        userId: req.body.userId,
      },
    });
    return res.status(200).json(updatedOutfit);
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
        items: {
          select: {
            type: true,
            image: true,
          },
        },
      },
    });
    const transformedData = outfits.map((outfit) => {
      const { id, log, items } = outfit;
      let transformedItems = {};
      items.forEach((item) => {
        transformedItems[item.type.toLowerCase()] = item.image;
      });

      return { id, log, ...transformedItems };
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
    const { log, itemsIds } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Id is required" });
    }
    const updatedOutfit = await prisma.outfit.update({
      where: {
        id,
      },
      data: {
        log,
        itemsIds,
        items: {
          connect: req.body.itemIds.map((itemId) => ({ id: itemId })),
        },
      },
    });
    return res.status(200).json(updatedOutfit);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};
