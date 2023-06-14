import express from "express";
import { prisma } from "../utils/prisma";
import { loginTypeDto } from "../types/loginType";
import { emailVerifyTypeDto } from "../types/emailVerifyType";
import jwt from "jsonwebtoken";

const loginRouter = express.Router();

loginRouter.get("/", async (req, res) => {
  const { username, password } = req.body as loginTypeDto;
  const result = await prisma.user.findFirst({
    where: {
      username: username,
    },
    select: {
      password: true,
      token: true,
    },
  });

  if (result) {
    console.log(result.password);
    console.log(password);
    if (result.password === password) {
      const token = jwt.sign({ username }, "your_secret_key");
      await prisma.user.update({
        where: {
          username: username,
        },
        data: {
          token: token,
        },
      });
      return res.json({ token });
    } else {
      return res.status(401).send("Invalid password");
    }
  } else {
    return res.status(404).send("User not found");
  }
});

export default loginRouter;
