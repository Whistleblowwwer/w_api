import { User } from "../models/users.js";
import { Business } from "../models/business.js";
import { Review } from "../models/reviews.js";

// Create Review
export const createReview = async (req, res) => {
  const _id_business = req.params._id_business;
  const _id_user = req.user._id_user;
  const { content } = req.body;

  if (!_id_business) {
    return res.status(400).send({ message: "Missing business ID" });
  }
  if (!_id_user) {
    return res.status(400).send({ message: "Missing user ID" });
  }
  if (!content) {
    return res.status(400).send({ message: "Missing content for the review" });
  }

  try {
    const business = await Business.findByPk(_id_business);
    if (!business) {
      return res.status(404).send({ message: "Business not found" });
    }

    const user = await User.findByPk(_id_user);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const review = await Review.create({
      content,
      _id_business,
      _id_user,
    });

    return res
      .status(201)
      .send({ message: "Review created successfully", review });
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
};
