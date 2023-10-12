const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { bucketName, s3 } = require("../middlewares/s3.js");
const { upload } = require("../middlewares/multer.js");

import { User } from "../models/users.js";
import { Buisiness } from "../models/business.js"
import { Review } from "../models/reviews.js"

export const uploadFile = async (req, res) => {
    try{
        const { id, photo_type } = req.body;

        upload.single('fileN')(req, res, async (err) => {
            if (err) {
                return res.status(404).send({ message: "Internal Error" });
            } else {
                //Get image and check it is an image type file.
                contentType = req.file.mimetype;
                if (contentType !== "image/*") {
                    return res.status(400).send({ message: "Unsupported Media Type" });
                }
    
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
                
                await s3.send(command);

                //Updates the specified row of the specified table in the DB with the FilePath inside the Bucket.
                if(photo_type === "users_profile_img"){
                    const _id_user = id;
                    const profile_picture = fileName;
                    const user = await User.findOne({
                        where: { _id_user },
                        attributes: { exclude: ["password_token"] },
                    });
            
                    if (!user) {
                        return res.status(400).send({ message: "User not found" });
                    }

                    await User.update(
                        {
                            profile_picture,
                        },
                        { where: { _id_user } }
                    );
                }
                else if(photo_type === "business_header_img"){
                    const _id_business = id;
                    const profile_picture = fileName; // Awaiting variable name
                    const business = await Buisiness.findOne({
                        where: { _id_business },
                    });
            
                    if (!business) {
                        return res.status(400).send({ message: "Buisiness not found" });
                    }

                    await Buisiness.update(
                        {
                            profile_picture, // Awaiting variable name
                        },
                        { where: { _id_business } }
                    );
                }
                else if(photo_type === "reviews_imgs"){
                    const _id_review = id;
                    const profile_picture = fileName; // Awaiting variable name
                    const review = await Review.findOne({
                        where: { _id_review },
                    });
            
                    if (!review) {
                        return res.status(400).send({ message: "Review not found" });
                    }

                    await Review.update(
                        {
                            profile_picture, // Awaiting variable name
                        },
                        { where: { _id_business } }
                    );
                }
                else{
                    return res.status(400).send({ message: "No photo type specified" });
                }
                return res.status(200).send({ message: "File Uploaded Successfully  "})
            }
        });
    }
    catch(err){
        return res.status(500).send({ error: err.message });
    }
    
}
