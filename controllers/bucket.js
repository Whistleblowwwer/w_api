import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { bucketName, s3 } from "../middlewares/s3.js";
import { upload } from "../middlewares/multer.js";

import { User } from "../models/users.js";
import { Business } from "../models/business.js"
import { Review } from "../models/reviews.js"
import { ReviewImages } from "../models/reviewImages.js";
import { BuisnessCache } from "../middlewares/cache.js";

export const uploadFile = async (req, res) => {
    try{
        const { id, photo_type} = req.query;
        upload.array('fileN', 20)(req, res, async (err) => {
        
            if (err) {
                return res.status(404).send({ message: "Internal Error" });
            } else {
                //Get image and check it is an image type file.
                const files = req.files
                
                for (const file of files) {

                    const contentType = file.mimetype;
                
                    //Prepare file for bucket and send file.
                    const fileBuffer = file.buffer;
                    var fileName
                    var _id_review_image
                    if(photo_type === "users_profile_img"){
                        fileName = `${photo_type}/${id}`;
                    }
                    else if(photo_type === "business_header_img"){
                        fileName = `${photo_type}/${id}`;
                    }
                    else if(photo_type === "reviews_img"){
                        
                        const review = await Review.findByPk(id)

                        if (!review) {
                            return res.status(400).send({ message: "Review not found" });
                        }

                        const reviewimage = await ReviewImages.create({
                            image_url: "null",
                            _id_review: review._id_review
                        });

                        _id_review_image = reviewimage._id_review_image

                        console.log(review._id_business)

                        fileName = `${photo_type}/${review._id_business}/${id}/${_id_review_image}`;
                    }
                    else{
                        return res.status(400).send({ message: "No photo type specified" });
                    }
                    
                    const params = {
                        Bucket: bucketName,
                        Key: fileName,
                        Body: fileBuffer,
                        ContentType: contentType
                    }
        
                    const command = new PutObjectCommand(params);

                    await s3.send(command);
                    
                    const getObjectParams = {
                        Bucket: bucketName,
                        Key: fileName
                    }
                    const commandurl = new GetObjectCommand(getObjectParams);
                    const url = await getSignedUrl(s3, commandurl);

                    //Updates the specified row of the specified table in the DB with the FilePath inside the Bucket.
                    if(photo_type === "users_profile_img"){
                        const _id_user = id;
                        const profile_picture_url = url;
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
                        const profile_picture_url = url;
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
                        const image_url = url;
                        const review = await Review.findOne({
                            where: { _id_review },
                        });
                
                        if (!review) {
                            return res.status(400).send({ message: "Review not found" });
                        }

                        await ReviewImages.update(
                            {image_url},
                            { where: { _id_review_image}});

                    }
                    else{
                        return res.status(400).send({ message: "No photo type specified" });
                    }
                    return res.status(200).send({ message: "File/Files Uploaded Successfully"})
                }
            }
        });
    }
    catch(error){
        return res.status(500).send({ error: error.message });
    }   
}

export const getUrl = async (req, res) => {
    try{
        
        return res.status(201).send({fileName: filepath, url: url});

    }
    catch(error){
        return res.status(500).send({ error: error.message });
    }
}