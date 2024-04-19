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
    const { logOutfitData } = req.body;
    let orderBy = {};
    if (logOutfitData) {
      orderBy = { logDate: "asc" };
    } else {
      orderBy = { createdAt: "desc" };
    }
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
      orderBy,
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
    const { log, logDate, futureDate } = req.body;
    const data = {};

    // Check if log is provided and add it to the data object
    if (log) {
      data.log = log;
    }

    // Check if logDate is provided and add it to the data object
    if (logDate) {
      data.logDate = logDate;
    }

    // Check if futureDate is provided and add it to the data object
    if (futureDate) {
      data.futureDate = futureDate;
    }

    const updatedOutfit = await prisma.outfit.update({
      where: {
        id,
      },
      data,
    });
    return res.status(200).json(updatedOutfit);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};

export const checkFutureDateOutfit = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }
    const checkOutfit = await prisma.outfit.findMany({
      where: {
        AND: [
          {
            futureDate: {
              gte: date,
            },
          },
          {
            userId: req.userId,
          },
        ],
      },
    });

    const fdate = checkOutfit[0]?.futureDate;
    const date1 = new Date(fdate);
    const date2 = new Date(date);

    const diffInMilliseconds = Math.abs(date1.getTime() - date2.getTime());
    const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));

    return res
      .status(200)
      .json(
        `You have an outfit planned in ${diffInDays} days. Make sure it is ready be worn.`
      );
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};
