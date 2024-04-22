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
    const { logOutfitData } = req.query;
    let orderBy = {};
    let where = {};
    if (logOutfitData === "true") {
      where = { AND: [{ userId: req.userId }, { log: true }] };
      orderBy = { logDate: "asc" };
    } else {
      where = { userId: req.userId };
      orderBy = { createdAt: "desc" };
    }

    let outfits = await prisma.outfit.findMany({
      where,
      include: {
        items: true,
      },
      orderBy,
    });

    if (logOutfitData === "true") {
      outfits = outfits.flatMap((item) =>
        item.logDate.map((date) => ({
          id: item.id,
          log: item.log,
          logDate: date,
          userId: item.userId,
          items: item.items,
        }))
      );
    }

    const transformedData = outfits.map((outfit) => {
      const { id, log, items, logDate, userId } = outfit;
      let transformedItems = {};
      items.forEach((item) => {
        transformedItems[item.type.toLowerCase()] = {
          image: item.image,
          isDeleted: item.isDeleted,
        };
      });

      return { id, log, logDate, userId, ...transformedItems };
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
    const data = {};
    data.log = log;

    const outfit = await prisma.outfit.findUnique({
      where: {
        id,
      },
      select: {
        items: true,
        logDate: true,
      },
    });

    if (logDate) {
      const combinedArray = [...outfit.logDate, ...logDate];
      data.logDate = combinedArray;
    }

    // Update the usage field for each item associated with the outfit
    await Promise.all(
      outfit.items.map(async (item) => {
        return await prisma.item.update({
          where: {
            id: item.id,
          },
          data: {
            usage: item.usage + 1,
          },
        });
      })
    );

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
    const { currentDate } = req.query;
    if (!currentDate) {
      return res.status(400).json({ message: "date is required" });
    }
    const checkOutfit = await prisma.outfit.findMany({
      where: {
        AND: [
          {
            logDate: {
              gte: currentDate,
            },
          },
          {
            userId: req.userId,
          },
        ],
      },
      orderBy: { logDate: "asc" },
    });

    const fdate = checkOutfit[0]?.logDate;
    const date1 = new Date(fdate);
    const date2 = new Date(currentDate);

    const diffInMilliseconds = Math.abs(date1.getTime() - date2.getTime());
    let diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));

    if (isNaN(diffInDays)) {
      diffInDays = 0;
      return res.status(200).json("");
    }
    return res
      .status(200)
      .json(
        `You have an outfit planned in ${diffInDays} days. Make sure it is ready be worn.`
      );
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};
