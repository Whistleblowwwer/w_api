import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

import { bucketName, s3 } from "../utils/s3.js";
import { upload } from "../utils/multer.js";

import { User } from "../models/users.js";
import { Business } from "../models/business.js";
import { Review } from "../models/reviews.js";
import { ReviewImages } from "../models/reviewImages.js";
import { Comment } from "../models/comments.js";
import { CommentImages } from "../models/commentImages.js";

export const uploadFile = async (req, res) => {
    try {
        const { id, photo_type } = req.query;
        const imageUrls = [];
        const _id_user_requesting = req.user._id_user;

        upload.array("fileN", 8)(req, res, async (err) => {
            if (err) {
                return res
                    .status(404)
                    .send({ message: "Internal Error", Error: err });
            } else {
                //Get image and check it is an image type file.
                const files = req.files;

                for (const file of files) {
                    const contentType = file.mimetype;

                    //Prepare file for bucket and send file.
                    const fileBuffer = file.buffer;
                    var fileName;
                    var _id_review_image;
                    if (photo_type === "users_profile_img") {
                        fileName = `${photo_type}/${_id_user_requesting}`;
                    } else if (photo_type === "business_header_img") {
                        fileName = `${photo_type}/${id}`;
                    } else {
                        return res
                            .status(400)
                            .send({ message: "No photo type specified" });
                    }

                    imageUrls.push(
                        "https://w-images-bucket.s3.amazonaws.com/" + fileName
                    );

                    const params = {
                        Bucket: bucketName,
                        Key: fileName,
                        Body: fileBuffer,
                        ContentType: contentType,
                    };

                    const command = new PutObjectCommand(params);

                    await s3.send(command);

                    const getObjectParams = {
                        Bucket: bucketName,
                        Key: fileName,
                    };
                    const commandurl = new GetObjectCommand(getObjectParams);

                    //Updates the specified row of the specified table in the DB with the FilePath inside the Bucket.

                    if (photo_type === "users_profile_img") {
                        const profile_picture_url =
                            "https://w-images-bucket.s3.amazonaws.com/" +
                            fileName;

                        await User.update(
                            {
                                profile_picture_url,
                            },
                            { where: { _id_user: _id_user_requesting } }
                        );
                    } else if (photo_type === "business_header_img") {
                        const _id_business = id;
                        const profile_picture_url =
                            "https://w-images-bucket.s3.amazonaws.com/" +
                            fileName;
                        const business = await Business.findOne({
                            where: { _id_business },
                        });

                        if (!business) {
                            return res
                                .status(400)
                                .send({ message: "Business not found" });
                        }

                        await Business.update(
                            {
                                profile_picture_url,
                            },
                            { where: { _id_business } }
                        );
                    } else {
                        return res
                            .status(400)
                            .send({ message: "No photo type specified" });
                    }
                }
                return res.status(200).send({
                    message: "Files submitted correctly",
                    Images: imageUrls,
                });
            }
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

export const UploadReviewImage = async (req, res) => {
    try {
        const _id_review = req.query._id_review;
        const imageUrls = [];
        const _id_user_requesting = req.user._id_user;

        upload.array("fileN", 8)(req, res, async (err) => {
            if (err) {
                return res
                    .status(404)
                    .send({ message: "Internal Error", Error: err });
            } else {
                //Get image and check it is an image type file.
                const files = req.files;

                for (const file of files) {
                    const contentType = file.mimetype;

                    // Prepare file for bucket and send file.
                    const fileBuffer = file.buffer;
                    var fileName;
                    var _id_review_image;
                    const review = await Review.findByPk(_id_review);
                    if (!review) {
                        return res
                            .status(400)
                            .send({ message: "Review not found" });
                    }

                    const reviewimage = await ReviewImages.create({
                        image_url: "null",
                        _id_review: review._id_review,
                    });

                    _id_review_image = reviewimage._id_review_image;

                    fileName = `reviews_img/${review._id_business}/${_id_review}/${_id_review_image}`;

                    imageUrls.push(
                        "https://w-images-bucket.s3.amazonaws.com/" + fileName
                    );

                    const params = {
                        Bucket: bucketName,
                        Key: fileName,
                        Body: fileBuffer,
                        ContentType: contentType,
                    };

                    const command = new PutObjectCommand(params);

                    const getObjectParams = {
                        Bucket: bucketName,
                        Key: fileName,
                    };
                    const commandurl = new GetObjectCommand(getObjectParams);

                    //Updates the specified row of the specified table in the DB with the FilePath inside the Bucket.

                    const image_url =
                        "https://w-images-bucket.s3.amazonaws.com/" + fileName;

                    await ReviewImages.update(
                        { image_url },
                        { where: { _id_review_image } }
                    );
                    await s3.send(command);
                }
                return res.status(200).send({
                    message: "Files submitted correctly",
                    Images: imageUrls,
                });
            }
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

export const UploadCommentImage = async (req, res) => {
    try {
        const { _id_comment } = req.query;
        const imageUrls = [];
        //const _id_user_requesting = req.user._id_user;
        upload.array("fileN", 8)(req, res, async (err) => {
            if (err) {
                return res
                    .status(404)
                    .send({ message: "Internal Error", Error: err });
            } else {
                //Get image and check it is an image type file.
                const files = req.files;

                for (const file of files) {
                    const contentType = file.mimetype;

                    //Prepare file for bucket and send file.
                    const fileBuffer = file.buffer;

                    const comment = await Comment.findByPk(_id_comment);
                    if (!comment) {
                        return res
                            .status(400)
                            .send({ message: "Comment not found" });
                    }

                    const commentimage = await CommentImages.create({
                        image_url: "null",
                        _id_comment: comment._id_comment,
                    });

                    const _id_comment_image = commentimage._id_comment_image;

                    const fileName = `comments_img/${_id_comment}/${_id_comment_image}`;

                    imageUrls.push(
                        "https://w-images-bucket.s3.amazonaws.com/" + fileName
                    );

                    const params = {
                        Bucket: bucketName,
                        Key: fileName,
                        Body: fileBuffer,
                        ContentType: contentType,
                    };

                    const command = new PutObjectCommand(params);

                    //Updates the specified row of the specified table in the DB with the FilePath inside the Bucket.
                    const image_url =
                        "https://w-images-bucket.s3.amazonaws.com/" + fileName;

                    await CommentImages.update(
                        { image_url },
                        { where: { _id_comment_image } }
                    );

                    await s3.send(command);
                }
                return res.status(200).send({
                    message: "Files submitted correctly",
                    Images: imageUrls,
                });
            }
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

export const getUrl = async (req, res) => {
    try {
        return res.status(201).send({ fileName: filepath, url: url });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};
