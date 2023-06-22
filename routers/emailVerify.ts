import express from "express";
import { prisma } from "../utils/prisma";
import { emailVerifyTypeDto } from "../types/emailVerifyType";

const emailVerifyRouter = express.Router();
emailVerifyRouter.get("/", async (req, res) => {
  const { token } = req.query as any as emailVerifyTypeDto;
  const id = parseInt(req.query.id as string);

  const result = await prisma.user.findFirst({
    where: {
      id: id,
    },
    select: {
      token: true,
    },
  });

  if (result?.token === token) {
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        verify_status: true,
      },
    });
    return res.send("Verify success");
  } else {
    return res.send("Verify fail");
  }
});

export default emailVerifyRouter;
