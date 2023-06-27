import express, { NextFunction } from "express";
import { Request, Response } from "express";
import bodyParser from "body-parser";
import { prisma } from "../utils/prisma";
import { RegisterDto } from "../types/Register";

const resendEmailRouter = express.Router();
resendEmailRouter.get("/", async (req, res) => {
//   const userId = (req as any).user.userId;
  const userId = req.body.userId;
  //   let phone_number as string;
  const token = (Math.random() + 1).toString(36).substring(7);
  console.log("random", token);

//   try {
//     let user = await prisma.user.findFirst({
//       where: {
//         username: username,
//       },
//     });
//     if (user) {
//       return res.status(400).send("Username already in use !");
//     }
//     user = await prisma.user.findFirst({
//       where: {
//         email: email,
//       },
//     });
//     if (user) {
//       return res.status(400).send("Email already in use !");
//     }
//   } catch (error) {
//     return res.status(500).send("Unable to validate username !");
//   }

  const Info = await prisma.user.findUnique({
    where : {
        id : userId,
    },
    select : {
        id : true,
        email : true,
        token : true,
    }
    // data: {
    //   email,
    //   username,
    //   password,
    //   phone_number,
    //   token,
    //   verify_status: false,
    //   reserveId: 0,
    //   id,
    //   firstname,
    //   lastname,
    //   birthdate: new Date(birthdate),
    // },
  });
  // return res.send(Info);
  console.log(Info);

  const nodemailer = require("nodemailer");
  let testAccount = nodemailer.createTestAccount();

  let transporter = await nodemailer.createTransport({
    host: "mail.bsthun.com",
    port: 587,
    secure: false,
    auth: {
      user: "imjai@parnlees.me",
      pass: "imjai1212312121",
    },
  });

  let info = await transporter.sendMail({
    from: '"IMJAI Application" <imjai@parnlees.me>', // sender address
    to: Info!.email, // list of receivers
    subject: "[IMJAI] Verify your email", // Subject line
    text:
      "To secure your IMJAI account, we just need to verify your email address: http://localhost:3306/emailVerify?id=" +
      Info!.id +
      "&token=" +
      Info!.token, // plain text body
  }); // plain text body

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

//   if (!Info) {
//     console.log(Info);
//     return res.send("Register fail !");
//   } else {
//     console.log(Info);
//     return res.send("Register complete !");
//   }
});

export default resendEmailRouter;
