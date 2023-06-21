import express from "express";
import { prisma } from "../utils/prisma";
import { PostProductDto } from "../types/post_product";
import { PostProductDetailsDto } from "../types/post_product_details";

const productRouter = express.Router();

// Create post for products
productRouter.post("/", async (req, res) => {
  const userId = (req as any).user.id;
  const data = req.body as PostProductDto;

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      created_products: {
        create: {
          reservedId: data.reserve_id,
          name: data.product_name,
          picture_url: data.product_picture,
          description: data.product_description,
          available_time: data.product_time,
          category_id: data.category_id,
          location_latitude: data.locate_latitude,
          location_longtitude: data.locate_longtitude,
          status: data.status,
          is_reserved: data.reserved_yet,
        },
      },
    },
  });
  return res.send("Created product complete!");
});

// Get product details
productRouter.get("/:product_id", async (req, res) => {
  const productId = parseInt(req.params.product_id);

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      created_by_user: {
        select: {
          firstname: true,
          lastname: true,
        },
      },
    },
  });
  if (!product) {
    return res.json({ error: "Product not found." });
  }

  // const category = await prisma.category.findUnique({
  //   where: {
  //     id: category_id,
  //   },
  // });
  const {
    created_by_user: { firstname, lastname },
  } = product;
  const {
    product_name,
    product_picture,
    product_description,
    product_time,
    category_id,
    locate_range,
  } = req.body as PostProductDetailsDto;

  return res.send({
    name: product_name,
    picture_url: product_picture,
    details: product_description,
    available_time: product_time,
    category: category_id,
    range: locate_range,
    giver_name: `${firstname} ${lastname}`,
    // category: product.category,
  });
});

// List all products that user posted
productRouter.get("/", async (req, res) => {
  const userId = (req as any).user.id;

  const products = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      created_products: true,
    },
  });
  return res.send(products);
});

// List all order products that user reserved
productRouter.get("/", async (req, res) => {
  const userId = (req as any).user.id;

  const reserves = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      reserved_products: true,
    },
  });
  return res.send(reserves);
});

// Delete a product that user post
productRouter.delete("/:product_id", async (req, res) => {
  const productId = parseInt(req.params.product_id);
  const userId = (req as any).user.id;

  const deleteProduct = await prisma.product.delete({
    where: {
      id: productId,
      userId: userId,
    },
    select: {
      created_by_user: true,
    },
    //    data: {
    //       product_order: {
    //         disconnect: {
    //             id: productId,
    //         },
    //       },
    //    },
  });
  return res.send(deleteProduct);
});

// Reserve an Order
productRouter.post("/:product_id/reserve", async (req, res) => {
  const userId = (req as any).user.id;
  const productId = parseInt(req.params.product_id);
  const orderId = +req.body.orderId;
  const giverId = +req.body.giverId;
  const receiverId = +req.body.recieverId;

  const donated = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });
  if (!donated) {
    return res.json({ error: "Sorry! Can not found the order." });
  }

  const reservation = await prisma.reserve.create({
    data: {
      userId: userId,
      productId: productId,
      orderId: orderId,
      giverId: giverId,
      recieverId: receiverId,
    },
  });
  return res.send(reservation);
});

export default productRouter;
