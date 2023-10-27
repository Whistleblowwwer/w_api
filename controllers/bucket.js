import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { bucketName, s3 } from "../middlewares/s3.js";
import { upload } from "../middlewares/multer.js";

import { User } from "../models/users.js";
import { Business } from "../models/business.js"
import { Review } from "../models/reviews.js"

export const uploadPhoto = async (req, res) => {
    try{
        const { id, photo_type } = req.query;
        upload.single('fileN')(req, res, async (err) => {
            
            if (err) {
                return res.status(404).send({ message: "Internal Error" });
            } else {
                //Get image and check it is an image type file.
                const contentType = req.file.mimetype;
                // if (contentType !== "image/jpeg") {
                //     return res.status(400).send({ message: "Unsupported Media Type" });
                // }
    
                //Prepare file for bucket and send file.
                const file = req.file.buffer;
                const fileName = `${photo_type}/${id}`;
                const params = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: file,
                    ContentType: contentType
                }
    
                const command = new PutObjectCommand(params);

                //Updates the specified row of the specified table in the DB with the FilePath inside the Bucket.
                if(photo_type === "users_profile_img"){
                    const _id_user = id;
                    const profile_picture_url = fileName;
                    const user = await User.findOne({
                        where: { _id_user },
                        attributes: { exclude: ["password_token"] },
                    });
            
                    if (!user) {
                        return res.status(400).send({ message: "User not found" });
                    }

                    await User.update(
                        {
                            profile_picture_url,
                        },
                        { where: { _id_user } }
                    );
                }
                else if(photo_type === "business_header_img"){
                    const _id_business = id;
                    const profile_picture_url = fileName;
                    const business = await Business.findOne({
                        where: { _id_business },
                    });
            
                    if (!business) {
                        return res.status(400).send({ message: "Business not found" });
                    }

                    await Business.update(
                        {
                            profile_picture_url,
                        },
                        { where: { _id_business } }
                    );
                }
                else if(photo_type === "reviews_img"){
                    const _id_review = id;
                    const image_url = fileName;
                    const review = await Review.findOne({
                        where: { _id_review },
                    });
            
                    if (!review) {
                        return res.status(400).send({ message: "Review not found" });
                    }

                    await Review.update(
                        {
                            image_url,
                        },
                        { where: { _id_review } }
                    );
                }
                else{
                    return res.status(400).send({ message: "No photo type specified" });
                }
                await s3.send(command);
                return res.status(200).send({ message: "Photo Uploaded Successfully  "})
            }
        });
    }
    catch(error){
        return res.status(500).send({ error: error.message });
    }
    
}

export const uploadVideo = async (req, res) => {
    try{
        const { id, video_type } = req.query;
        upload.single('fileN')(req, res, async (err) => {
            
            if (err) {
                return res.status(404).send({ message: "Internal Error" });
            } else {
                //Get image and check it is an image type file.
                const contentType = req.file.mimetype;
                // if (contentType !== "image/jpeg") {
                //     return res.status(400).send({ message: "Unsupported Media Type" });
                // }
    
                //Prepare file for bucket and send file.
                const file = req.file.buffer;
                const fileName = `${video_type}/${id}`;
                const params = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: file,
                    ContentType: contentType
                }
    
                const command = new PutObjectCommand(params);
                await s3.send(command);
                return res.status(200).send({ message: "Video Uploaded Successfully  "})
            }
        });
    }
    catch(error){
        return res.status(500).send({ error: error.message });
    }
    
}

export const getFile = async (req, res) => {
    const { id, photo_type } = req.query;
    var file = null;

    if(photo_type === "users_profile_img"){
        const _id_user = id;
        const user = await User.findOne({
            where: { _id_user },
            attributes: { exclude: ["password_token"] },
        });
        if (!user) {
            return res.status(400).send({ message: "Business not found" });
        }

        file = user.profile_picture_url;
        
    }
    else if(photo_type === "business_header_img"){
        const _id_business = id;
        const business = await Business.findOne({
            where: { _id_business },
        });
        if (!business) {
            return res.status(400).send({ message: "Business not found" });
        }

        file = business.profile_picture_url;
        
    }
    else if(photo_type === "reviews_img"){
        const _id_review = id;
        const review = await Review.findOne({
            where: { _id_review },
        });
        if (!review) {
            return res.status(400).send({ message: "Business not found" });
        }

        file = review.image_url;
        
    }

    const getObjectParams = {
        Bucket: bucketName,
        Key: file
    }
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.status(201).json({
        fileName: file,
        url: url
    });
}

