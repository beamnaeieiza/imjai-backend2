import express from "express";
let app = express();
import verifySignupRouter from "./middleware/verifySignup";
import { prisma } from "./utils/prisma";
import emailVerifyRouter from "./middleware/emailVerify";
import loginRouter from "./middleware/login";
import reserveRecieverRouter from "./routers/reserveReciever";

console.log("hello world");

app.use(express.json());
app.use("/verifySignup", verifySignupRouter);
app.use("/emailVerify", emailVerifyRouter);
app.use("/login", loginRouter);
app.use("/reserveReciever", reserveRecieverRouter);

app.listen(3306, () => {
  console.log("Application is running.");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
