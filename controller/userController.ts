import { BlobServiceClient } from "@azure/storage-blob";
import multer from 'multer';
import sharp from "sharp";
// import dotenv from "dotenv";
import catchAsync from "./catchAsync";
import AppError from "./appError";
// dotenv.config({ path: './config.env' });
import dotenv from 'dotenv';import { prisma } from "../utils/prisma";
 dotenv.config();
const multerStorage = multer.memoryStorage();
const multerFilter = (req : any, file : any, cb : any) => {
    //Only accept image files
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};



const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!);

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${(req as any).user.userId}-${Date.now()}.jpeg`;

    // Resize the image to 400x400
const resizedImageBuffer = await sharp(req.file.buffer)
.resize(400, 400)
.toBuffer();

// Upload the resized image to Azure Blob Storage
const containerClient = blobServiceClient.getContainerClient('user-photos');
const blockBlobClient = containerClient.getBlockBlobClient(req.file.filename);

await blockBlobClient.uploadData(resizedImageBuffer, {
blobHTTPHeaders: {
    blobContentType: 'image/jpeg',
},
});

next();

});


// const filterObj = (obj : any, ...allowedFields : any) => {
//     const newObj = {};
//     Object.keys(obj).forEach(el => {
//         if (allowedFields.includes(el)) newObj[el] = obj[el];
//     });
//     return newObj;
// };

export const updateMe = catchAsync(async (req, res, next) => {
    // Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
    return next(
    new AppError(
    'This route is not for password updates. Please use /updateMyPassword.',
    400
    )
    );
    }

    // Filtered out unwanted fields names that are not allowed to be updated
    // const filteredBody = filterObj(req.body, 'name', 'email');
    // if (req.file) filteredBody.photo = req.file.filename;

    // Update user document
    const userId = (req as any).user.userId;
    try {
      const userProfile = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {

        }
      });



    // const updatedUser = await prisma.user.update.findByIdAndUpdate((req as any).user.userId, filteredBody, {
    //     new: true,
    //     runValidators: true
    // });

    const updatedUser = await prisma.user.update.findByIdAndUpdate(req.user.userId, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
} catch (error) {
    // Handle error
    next(error);
}
});

exports.getMe = catchAsync(async (req, res, next) => {
    // Get the current user
    const user = await User.findById(req.user.id).populate('shop');

    // Retrieve the file URL from Azure Blob Storage
    const fileUrl = `https://getgoods.blob.core.windows.net/user-photos/${user.photo}`;

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone : user.phone,
                photo: fileUrl, // Add the file URL to the response
                shop: user.shop,
            }
        }
    });
});