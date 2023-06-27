import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import { prisma } from '../utils/prisma';
import { PostProductDto } from '../types/post_product';

const app = express();
const upload = multer();
const imageRouter = express.Router();
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=imjai;AccountKey=laKs2iQ5jS3BI9Moo80lJRk1Ah7A6l7YKBirSSRu8kzDPzcjxqvj9m68G09CBYCFq97lT0XEsJnn+AStDZO5bQ==;EndpointSuffix=core.windows.net';
const containerName = 'product';

// Create a BlobServiceClient instance
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Upload route
imageRouter.post('/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No image file provided' });
        return;
      }
      const userId = (req as any).user.userId;
      const productId = req.body.productId;
      const productName = req.body.productName as string;
      const imageBuffer = req.file.buffer;
      const blobName = `image-${userId}-${productName}.jpg`;
      const imageUrl = "https://imjai.blob.core.windows.net/product/"+blobName;

      //upload url to database
      // const updatedUser = await prisma.product.update({
      //   where: {
      //     name: productName,
      //   },
      //   data: {
      //     picture_url : imageUrl
      //   },
      // });

      
        // const userId = (req as any).user.userId;
        const data = req.body as PostProductDto;
        // data.category_id = parseInt(data.category_id);
        const result = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            created_products: {
              create: {
                // reservedId: data.reserve_id,
                name: data.product_name,
                picture_url: imageUrl,
                description: data.product_description,
                available_time: data.product_time,
                category_id: parseInt(data.category_id),
                location_latitude: data.locate_latitude,
                location_longtitude: data.locate_longtitude,
                status: 0,
                is_reserved: false,
                
              },
            },
          },
        });
        // return res.send(result);
  
      // Get a reference to the container
      const containerClient = blobServiceClient.getContainerClient(containerName);
  
      // Get a block blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
      // Upload the image buffer to Azure Blob Storage
      await blockBlobClient.uploadData(imageBuffer);
  
      res.status(200).json({ message: 'Image uploaded successfully' });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });


  // Upload profile picture
imageRouter.post('/profile/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }
    const userId = (req as any).user.userId;
    // const productId = req.body.productId;
    // const productName = req.body.productName as string;
    const imageBuffer = req.file.buffer;
    const blobName = `image-${userId}-profile.jpg`;
    const imageUrl = "https://imjai.blob.core.windows.net/product/"+blobName;


      const result = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          profile_url : imageUrl,
        },
      });
      // return res.send(result);

    // Get a reference to the container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload the image buffer to Azure Blob Storage
    await blockBlobClient.uploadData(imageBuffer);

    res.status(200).json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

  app.get('/image', async (req, res) => {
    try {
      const productName = req.query.productName;
  
      if (!productName) {
        return res.status(400).json({ message: 'productName parameter is required' });
      }
  
      const userId = (req as any).user.userId; // Assuming you have user authentication implemented
  
      const blobName = `image-${userId}-${productName}.jpg`;
  
      // Get a reference to the container
      const containerClient = blobServiceClient.getContainerClient(containerName);
  
      // Get a block blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
      // Download the image as a buffer
      const imageBuffer = await blockBlobClient.downloadToBuffer();
  
      // Set the appropriate content type for the response
      res.contentType('image/jpeg');
  
      // Send the image buffer in the response
      res.send(imageBuffer);
    } catch (error) {
      console.error('Error retrieving image:', error);
      res.status(500).json({ message: 'Failed to retrieve image' });
    }
  });


  export default imageRouter;
// // Start the server
// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
