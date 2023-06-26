import express from "express";
import { prisma } from "../utils/prisma";
import { PostProductDto } from "../types/post_product";
import { PostProductDetailsDto } from "../types/post_product_details";

const productRouter = express.Router();

// Create post for products
productRouter.post("/", async (req, res) => {
  const userId = (req as any).user.userId;
  const data = req.body as PostProductDto;

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      created_products: {
        create: {
          // reservedId: data.reserve_id,
          name: data.product_name,
          picture_url: data.product_picture,
          description: data.product_description,
          available_time: data.product_time,
          category_id: data.category_id,
          location_latitude: data.locate_latitude,
          location_longtitude: data.locate_longtitude,
          status: 0,
          is_reserved: data.reserved_yet,
        },
      },
    },
  });
  return res.send("Created product complete!");
});

// Get product details
productRouter.get("/products/:product_id", async (req, res) => {
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

// List all products that user posted
productRouter.get("/getproducts", async (req, res) => {
  const userId = (req as any).user.userId;

  const products = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      created_products: true,
    },
  });
  console.log("test");
  return res.send(products);
});

// List all order products that user reserved
productRouter.get("/getreserves", async (req, res) => {
  const userId = (req as any).user.userId;

  const reserves = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      reserved_products: {
        include: {
          reserved_product: true,
        },
      },
    },
  });
  return res.send(reserves);
});

// Delete a product that user post
productRouter.delete("/:product_id", async (req, res) => {
  const productId = parseInt(req.params.product_id);
  const userId = 1;

  const deleteProduct = await prisma.product.delete({
    where: {
      id: productId,
      // userId: userId,
    },
    select: {
      created_by_user: true,
    },
  });
  return res.send(deleteProduct);
});

// Reserve an Order
productRouter.post("/:product_id/reserve", async (req, res) => {
  const userId = (req as any).user.userId;
  const productId = parseInt(req.params.product_id);

  try{
    const donated = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });
  } catch (err) {
    console.error(err);
    return res.status(400).send("Sorry! Can not found the order.");
  }

  try{
    const reservation = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      reserved_products: {
        create: {
          id: productId,
        },
      },
    },
  });
  } catch (err) {
  console.error(err);
    return res.status(400).send("Sorry! This product has been reserved.");
  }

  try{
    const productstatus = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      status: 1,
      is_reserved: true,
    },
  });
  } catch (err) {
  console.error(err);
    return res.status(400).send("Sorry! Can not update the order status.");
  }

  //return res.send(reservation);
});

export default productRouter;
