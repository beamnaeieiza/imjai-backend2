import { PhoneNumber } from './../node_modules/twilio/lib/interfaces.d';
import express from "express";
import { prisma } from "../utils/prisma";
import { RecieverWaitingStatus_PageDto } from "../types/RecieverWaitingStatus_Page";

const reserveRecieverRouter = express.Router();

reserveRecieverRouter.get("/availableTime", async (req, res) => {
  const { username } = req.body;

  try
});

//get user profile just name, pics
reserveRecieverRouter.get("/profile", async (req, res) => {
  const { username } = req.body;
  const { giverId } = req.body as RecieverWaitingStatus_PageDto;

  try {
    const profile = await prisma.Reserve.findFirst({
      where: {
        id: giverId,
      },
    });
    if(!profile){
      return res.status(404).send("User not found");
    } 
    console.log("profile", profile);
    return res.send({
      username: profile?.username,
      firstname: profile?.firstname,
      lastname: profile?.lastname,
      profile_pic: profile?.profile_url,
      phoneNumber: profile?.phone_number,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//Make outgoing call
const makeOutgoingCall = (phoneNumber) => {
  const client = require("twilio")(
    process.env.ACb1eda49c827e3f5dc61ccee5eef2328e,
    process.env.30145cd12fc604b6538387a2eea71a08
  );
      
  client.calls
    .create({
      url: "http://demo.twilio.com/docs/voice.xml",
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    })
    .then((call) => {
      console.log(call.sid);
    })
    .catch ((error) => {
    console.error("Failed to make outgoing call: " + error);
    });
}

//get product(reserve) info
reserveRecieverRouter.get("/reserve_info", async (req, res) => {
  const { id } = req.body as RecieverWaitingStatus_PageDto;

  try{
    const product = await prisma.product.findFirst({
      where: {
        id: id,
      },
      select:{
        name: true,
      }
    });

    if(!product){
      return res.status(404).send("Product not found");
    }
      return res.send({
        product_name: product.name,
      });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
}); 

export default reserveRecieverRouter;
