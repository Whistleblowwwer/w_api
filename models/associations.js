import { User } from "./users.js";
import { Business } from "./business.js";
import { Review } from "./reviews.js";
import { Comment } from "./comments.js";
import { BusinessFollowers } from "./businessFollowers.js";
import { UserFollowers } from "./userFollowers.js";
import { ReviewLikes } from "./reviewLikes.js";
import { CommentLikes } from "./commentLikes.js";

// Associations

// 1. Un user puede seguir a otro usuario
User.belongsToMany(User, {
    as: "Followers",
    through: UserFollowers,
    foreignKey: "_id_follower",
    otherKey: "_id_followed",
});

// 2. Un user puede crear y seguir a una empresa
User.hasMany(Business, { foreignKey: "_id_user" });
User.belongsToMany(Business, {
    as: "FollowedBusinesses",
    through: BusinessFollowers,
    foreignKey: "_id_user",
    otherKey: "_id_business",
});

// 3. Una empresa puede tener 0 o varios reviews
Business.hasMany(Review, { foreignKey: "_id_business" });

// 4. Un review puede tener 0 o varios comments
Review.hasMany(Comment, { foreignKey: "_id_review" });

// 5. Una empresa puede tener seguidores
Business.belongsToMany(User, {
    as: "bFollowers",
    through: BusinessFollowers,
    foreignKey: "_id_business",
    otherKey: "_id_user",
});

// 6. Un user puede hacer un review
User.hasMany(Review, { foreignKey: "_id_user" });

// 7. Un user puede likear un review
User.belongsToMany(Review, {
    as: "LikedReviews",
    through: ReviewLikes,
    foreignKey: "_id_user",
    otherKey: "_id_review",
});
Review.belongsToMany(User, {
    as: "Likers",
    through: ReviewLikes,
    foreignKey: "_id_review",
    otherKey: "_id_user",
});

// 8. Un user puede likear un comment
User.belongsToMany(Comment, {
    as: "LikedComments",
    through: CommentLikes,
    foreignKey: "_id_user",
    otherKey: "_id_comment",
});
Comment.belongsToMany(User, {
    as: "CommentLikers",
    through: CommentLikes,
    foreignKey: "_id_comment",
    otherKey: "_id_user",
});
