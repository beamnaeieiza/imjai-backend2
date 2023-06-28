import express from "express";
import { prisma } from "../utils/prisma";
import { loginTypeDto } from "../types/loginType";
import jwt from "jsonwebtoken";

const loginRouter = express.Router();

loginRouter.get("/", async (req, res) => {
  // const userId = (req as any).user.id;
  const { username, password } = req.body as loginTypeDto;
  const result = await prisma.user.findFirst({
    where: {
      username: username,
    },
    select: {
      id: true,
      password: true,
      token: true,
    },
  });

  if (result) {
    console.log(result.password);
    console.log(password);
    if (result.password === password) {
      const token = jwt.sign(
        { username: username, userId: result.id },
        "imjai1212312121",
        {
          expiresIn: "1h",
        }
      );
      return res.status(200).json({ token });
      // res.json({ token });
    } else {
      return res.status(401).send("Invalid password");
    }
  } else {
    return res.status(404).send("User not found");
  }
});

export default loginRouter;
