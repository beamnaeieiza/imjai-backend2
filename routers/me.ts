import express from "express";
import { prisma } from "../utils/prisma";
import { profileDto } from "../types/profile";
const meRouter = express.Router();

//update profile
meRouter.post("/me", async (req, res) => {
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
