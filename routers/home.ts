import express from "express";
import { prisma } from "../utils/prisma";
import { locationDto } from "../types/location";
const homeRouter = express.Router();

//
homeRouter.get("/me", async (req, res) => {
  const userId = (req as any).user.userId;
  try {
    const userProfile = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return res.send({
      id: userProfile!.id,
      // uid: userProfile!.uid,
      profile_url: userProfile!.profile_url,
      firstname: userProfile!.firstname,
      lastname: userProfile!.lastname,
      email: userProfile!.email,
      phone_number: userProfile!.phone_number,
      birthdate: userProfile!.birthdate,
      createdAt: new Date(userProfile!.createdAt).toISOString(),
      updatedAt: new Date(userProfile!.updatedAt).toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// update location
homeRouter.post("/update", async (req, res) => {
  const userId = 1;
  const data = req.body as locationDto;
  //const location_lattitude = req.body.location_lattitude;
  //const location_longtitude = req.body.location_longtitude;

  const updatedLocation = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      location_latitude: data.location_latitude,
      location_longtitude: data.location_longtitude,
    },
  });
  return res.send(updatedLocation);
});

// get current location
homeRouter.get("/location", async (req, res) => {
  const userId = (req as any).user.userId;
  const currentLocation = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      location_latitude: true,
      location_longtitude: true,
    },
  });
  return res.send(currentLocation);
});

//list all products
homeRouter.get("/list", async (req, res) => {
  const productList = await prisma.product.findMany({
    include: {
      created_by_user: true,
    },
  });

  return res.send(productList);
});

//Each Catagories
homeRouter.get("/:category_id", async (req, res) => {
  const categoryId = +req.params.category_id;

  const productList = await prisma.product.findMany({
    where: {
      category_id: categoryId,
    },
    include: {
      created_by_user: true,
    },
  });

  return res.send(productList);
});

export default homeRouter;
