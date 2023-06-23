import express from "express";
import { prisma } from "../utils/prisma";
import { RecieverWaitingStatus_PageDto } from "../types/RecieverWaitingStatus_Page";
import axios from "axios";

const reserveRecieverRouter = express.Router();

//Get user profile just name, pics, phone number, available time
reserveRecieverRouter.get("/profile", async (req, res) => {
  const {
    available_time,
    productId,
    userId,
    location_latitude,
    location_longtitude,
  } = req.query as unknown as RecieverWaitingStatus_PageDto;

  //Get profile pics, firstname, lastname **เหลือ test postman
  try {
    const profile = await prisma.reserve.findFirst({
      where: {
        id: productId,
      },
      select: {
        userId: true,
        reserved_users: {
          select: {
            profile_url: true,
            firstname: true,
            lastname: true,
            phone_number: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).send("User not found");
    }
    console.log("profile", profile);
    return res.send({
      profile_url: profile.reserved_users?.profile_url,
      firstname: profile.reserved_users?.firstname,
      lastname: profile.reserved_users?.lastname,
      phone_number: profile.reserved_users.phone_number,
      // location_lattitude: profile.reserved_users.location_latitude,
      // location_longttitude: profile.reserved_users.location_longtitude,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }

  //Get google map API **เหลือ API Key, test postman
  try {
    const map = await prisma.reserve.findFirst({
      where: {
        id: productId,
      },
      select: {
        userId: true,
        reserved_users: {
          select: {
            location_latitude: true,
            location_longtitude: true,
          },
        },
      },
    });
    if (!map || !map.reserved_users) {
      return res.status(404).send("Location not found");
    }

    const { location_latitude, location_longtitude } = map.reserved_users;
    //ยังไม่ได้ใส่ API Key
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location_latitude},${location_longtitude}&key=${process.env.GOOGLE_MAP_API_KEY}`;
    const geocodeResponse = await axios.get(geocodeUrl);
    const address = geocodeResponse.data.results[0]?.formatted_address;

    return res.send({
      address: address,
      location_latitude,
      location_longtitude,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }

  //Get available time **เหลือ test postman
  // const { productId } = req.query as unknown as RecieverWaitingStatus_PageDto;
  try {
    const time = await prisma.product.findFirst({
      where: {
        id: productId,
      },
      select: {
        available_time: true,
      },
    });
    return res.send(time);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//Make a call **เหลือ test postman, แก้ error
reserveRecieverRouter.get("/make-call", async (req, res) => {
  const { productId, userId } =
    req.query as unknown as RecieverWaitingStatus_PageDto;
  const phone_number = req.body.phone_number! as string;
  try {
    const result = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        phone_number: true,
      },
    });

    // const call =await prisma.user.create({
    //   where: {
    //     id: userId,
    //   },
    //   select:{
    //     phone_number: result.phone_number,
    //     status: 'initiated',
    //   },
    // });

    // res.status(200).json({message: "Call initiated", call});
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//Get product(reserve) info **เหลือ test postman,
reserveRecieverRouter.get("/reserve_info", async (req, res) => {
  const { productId } = req.query as unknown as RecieverWaitingStatus_PageDto;

  try {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
      },
      select: {
        name: true,
      },
    });

    if (!product) {
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

//////////////////////////////
//get product / giver information
reserveRecieverRouter.get("/reserves/:product_id", async (req, res) => {
  const productId = parseInt(req.params.product_id);

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      created_by_user: true,
    },
  });
  if (!product) {
    return res.json({ error: "Product not found." });
  }

  return res.send({
    product,
  });
});

//cancel reservation
reserveRecieverRouter.post("/reserves/cancel/:product_id", async (req, res) => {
  const userId = (req as any).user.userId;
  const productId = parseInt(req.params.product_id);

  const product = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      is_reserved: false,
    },
  });
  if (!product) {
    return res.json({ error: "Product not found." });
  }

  const productInfo = await prisma.product.findFirst({
    where: {
      id: productId,
    },
    select: {
      reserved: true,
    },
  });

  const deleteReservation = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      reserved: {
        delete: true,
      },
    },
    select: {
      reserved: true,
    },
  });

  return res.send({
    deleteReservation,
  });
});

//giver confirm to change product status
reserveRecieverRouter.post("/reserves/update/:product_id", async (req, res) => {
  const productId = parseInt(req.params.product_id);

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
    },
    select: {
      status: true,
    },
  });

  if (product?.status == 1) {
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: 2,
      },
    });
    return res.json("Change status to Preparing");
  } else if (product?.status == 2) {
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: 3,
      },
    });
    return res.json("Change status to Ready to Pick up");
  } else if (product?.status == 3) {
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: 4,
      },
    });
    return res.json("Change status to Completed");
  } else {
    return res.send("You can't change status anymore");
  }

  return res.send({
    product,
  });
});

export default reserveRecieverRouter;

//เหลือหน้า giver และ reciever ที่เหลือ,
//เชื่อม frontend หน้า sign in, log in, giver and reciever
