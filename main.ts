import express from "express";
let app = express();
import verifySignupRouter from "./routers/verifySignup";
import { prisma } from "./utils/prisma";
import emailVerifyRouter from "./routers/emailVerify";
import loginRouter from "./routers/login";
import reserveRecieverRouter from "./routers/reserveReciever";
import productRouter from "./routers/product";
import homeRouter from "./routers/home";
import meRouter from "./routers/me";
import sessionMiddleware from "./middlewares/session";

console.log("hello world");

app.use(express.json());
app.use("/verifySignup", verifySignupRouter);
app.use("/emailVerify", emailVerifyRouter);
app.use("/login", loginRouter);
app.use("/reserveReciever", sessionMiddleware, reserveRecieverRouter);
app.use("/products", sessionMiddleware, productRouter);
app.use("/home", sessionMiddleware, homeRouter);
app.use("/me", sessionMiddleware, meRouter);

app.listen(3306, () => {
  console.log("Application is running.");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
