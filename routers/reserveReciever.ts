import { PhoneNumber } from './../node_modules/twilio/lib/interfaces.d';
import express from "express";
import { prisma } from "../utils/prisma";
import { RecieverWaitingStatus_PageDto } from "../types/RecieverWaitingStatus_Page";
import twilio from 'twilio';

const reserveRecieverRouter = express.Router();

//Get user profile just name, pics, phone number, available time
reserveRecieverRouter.get("/profile", async (req, res) => {
  const { giverId } = req.body as RecieverWaitingStatus_PageDto;

  //Get profile pics, firstname, lastname
  try {
    const profile = await prisma.reserve.findFirst({
      where: {
        id: giverId,
      },
      include:{
        reserved_users: true,
     },
    });
    
    if(!profile){
    return res.status(404).send("User not found");
    } 
    console.log("profile", profile);
    return res.send({
      profile_url: profile.reserved_users.profile_url,
      firstname: profile.reserved_users.firstname,
      lastname: profile.reserved_users.lastname,
      phone_number: profile.reserved_users.phone_number,
      // location_lattitude: profile.reserved_users.location_latitude,
      // location_longttitude: profile.reserved_users.location_longtitude,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }

  //Make a call
  

  //Get available time
  try {
    const time = await prisma.reserve.findFirst({
      where: {
        id: giverId,
      },
      select: {
        reserved_users: {
          select: {
            producted
      },
    )};
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
}); 

//Get product(reserve) info
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
