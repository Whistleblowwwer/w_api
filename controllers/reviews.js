import { User } from "../models/users.js";
import { Business } from "../models/business.js";
import { Review } from "../models/reviews.js";

// Create Review
export const createReview = async (req, res) => {
    const { _id_business, _id_user } = req.query;
    const { content } = req.body;

    if (!_id_business) {
        return res.status(400).send({ message: "Missing business ID" });
    }
    if (!_id_user) {
        return res.status(400).send({ message: "Missing user ID" });
    }
    if (!content) {
        return res
            .status(400)
            .send({ message: "Missing content for the review" });
    }

    try {
        const businessReviewed = await Business.findByPk(_id_business);
        if (!businessReviewed) {
            return res.status(404).send({ message: "Business not found" });
        }

        const userCreatingReview = await User.findByPk(_id_user);
        if (!userCreatingReview) {
            return res.status(404).send({ message: "User not found" });
        }

        const createdReview = await Review.create({
            content,
            _id_business,
            _id_user,
        });

        return res.status(201).send({
            message: "Review created successfully",
            review: createdReview,
        });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).send({
                message: "Validation error",
                errors: error.errors,
            });
        } else {
            return res.status(500).send({ message: "Internal server error" });
        }
    }
};
