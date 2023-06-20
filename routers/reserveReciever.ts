import express from "express";
import { prisma } from "../utils/prisma";
import { RecieverWaitingStatus_PageDto } from "../types/RecieverWaitingStatus_Page";

const reserveRecieverRouter = express.Router();

//Get user profile just name, pics, phone number, available time
reserveRecieverRouter.get("/profile", async (req, res) => {
  const { available_time, productId, userId } = req.body as RecieverWaitingStatus_PageDto;

  //Get profile pics, firstname, lastname
  try {
    const profile = await prisma.reserve.findFirst({
      where: {
        id: productId,
      },
      select:{ //ดูว่าโปรดักส์นั้นใครเป็นคนสร้าง
        userId: true,
      },
    });
    
    if(!profile){
    return res.status(404).send("User not found");
    } 
    console.log("profile", profile);
    return res.send({
      profile_url: profile.created_by_user.profile_url,
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

  //Get google map API ยังไม่เสร็จ
  try {
    const map = await prisma.reserve.findFirst({
      where: {
        id: productId,
      },
      select:{
        userId: true,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }

  //Get available time
  try {
    const time = await prisma.product.findFirst({
      where: {
        id: productId,
      },
      select:{
        available_time: true,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
}); 

//Get product(reserve) info
reserveRecieverRouter.get("/reserve_info", async (req, res) => {
  const { productId } = req.body as RecieverWaitingStatus_PageDto;

  try{
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
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
