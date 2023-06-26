import express from "express";
import { prisma } from "../utils/prisma";
import { profileDto } from "../types/profile";
const meRouter = express.Router();

//update profile
meRouter.post("/update", async (req, res) => {
  const data = req.body as profileDto;
  const userId = (req as any).user.id;
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profile_url: data.profile_url,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      phone_number: data.phone_number,
      birthdate: data.birthdate,
    },
  });
  return res.send(updatedUser);
});

//get profile
meRouter.get("/", async (req, res) => {
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

export default meRouter;
