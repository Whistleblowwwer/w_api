import { BusinessFollowers } from "./businessFollowers.js";
import { UserFollowers } from "./userFollowers.js";
import { CommentLikes } from "./commentLikes.js";
import { CommentImages } from "./commentImages.js";
import { ReviewImages } from "./reviewImages.js";
import { ReviewLikes } from "./reviewLikes.js";
import { Category } from "./categories.js";
import { Business } from "./business.js";
import { Article } from "./articles.js";
import { Message } from "./messages.js";
import { Comment } from "./comments.js";
import { Review } from "./reviews.js";
import { User } from "./users.js";
// Associations

// A.belongsTo(B) association means One-To-One
// A.hasOne(B) association means One-To-One
// A.hasMany(B) association means One-To-Many
// A.belongsToMany(B, { through: 'C' }) association means Many-To-Many relationship, using table C as junction table

// ------------------ USER ------------------

// Un usuario puede seguir varios usuarios
// M:N
User.belongsToMany(User, {
    as: "Followed",
    through: UserFollowers,
    foreignKey: "_id_follower",
    otherKey: "_id_followed",
});

// Varios usuarios pueden seguir a un usuario
// M:N
User.belongsToMany(User, {
    as: "Followers",
    through: UserFollowers,
    foreignKey: "_id_followed",
    otherKey: "_id_follower",
});

// Un usuario puede crear varias empresas
// 1:N
User.belongsToMany(Business, { through: BusinessFollowers });

// Un usuario puede crear varias reseñas
// 1:N
User.hasMany(Review, { foreignKey: "_id_user" });

// Varios usarios pueden likear varias reseñas
// M:N
User.belongsToMany(Review, {
    through: ReviewLikes,
    foreignKey: "_id_user",
    otherKey: "_id_review",
    as: "LikedReviews",
});

// Un usuario puede enviar y recibir muchos mensajes
// 1:N
User.hasMany(Message, { foreignKey: "_id_sender", as: "SentMessages" });
// 1:N
User.hasMany(Message, { foreignKey: "_id_receiver", as: "ReceivedMessages" });

// Un usuario puede tener muchos comentarios
// 1:N
User.hasMany(Comment, { foreignKey: "_id_user", as: "Comments" });

// Un usuario puede publicar varios articulos
// 1:N
User.hasMany(Article, {
    foreignKey: "_id_user",
    as: "Articles",
});

// ------------------ BUSINESS ------------------
// Una empresa tiene un creador
// 1:1
Business.belongsTo(User, { foreignKey: "_id_user" });

// Una empresa tiene varias reseñas
// 1:N
Business.hasMany(Review, { foreignKey: "_id_business" });

// Una empresa tiene varios seguidores
// M:N
Business.belongsToMany(User, {
    as: "bFollowers",
    through: BusinessFollowers,
    foreignKey: "_id_business",
    otherKey: "_id_user",
});

// Un business tiene una categoria
// 1:1
Business.belongsTo(Category, { foreignKey: "_id_category" });

// ------------------ REVIEW ------------------
// Una reseña pertenece a una empresa
// 1:1
Review.belongsTo(Business, { foreignKey: "_id_business" });

// Una reseña tiene varios comentarios
// 1:n
Review.hasMany(Comment, { foreignKey: "_id_review" });

// Una reseña tiene un creador
// 1:1
Review.belongsTo(User, { foreignKey: "_id_user" });

// Una reseña puede ser likeada por varios usuarios
// M:N
Review.belongsToMany(User, {
    through: ReviewLikes,
    foreignKey: "_id_review",
    otherKey: "_id_user",
    as: "UserLikes",
});

// Una reseña puede tener varias imagenes
// 1:N
Review.hasMany(ReviewImages, { foreignKey: "_id_review" });
// ------------------ COMMENT ------------------

// Un comentario pertenece a un usuario
// 1:1
Comment.belongsTo(User, { foreignKey: "_id_user", as: "User" });

// Un comentario pertenece a una reseña
// 1:1
Comment.belongsTo(Review, { foreignKey: "_id_review" });

// Un comentario puede ser likead por varios usuarios
// M:N
Comment.belongsToMany(User, {
    as: "CommentLikers",
    through: CommentLikes,
    foreignKey: "_id_comment",
    otherKey: "_id_user",
});

// Un like pertenece a un comentario
// 1:1
CommentLikes.belongsTo(Comment, {
    foreignKey: "_id_comment",
    as: "comment",
});

// Un comentario puede tener muchos likes
// 1:N
Comment.hasMany(CommentLikes, {
    foreignKey: "_id_comment",
    as: "likes",
});

// Un comentario puede tener varios comentarios hijos
// 1:N
Comment.hasMany(Comment, { as: "Children", foreignKey: "_id_parent" });

// Un comentario puede tener un comentario padre
// 1:1
Comment.belongsTo(Comment, { as: "Parent", foreignKey: "_id_parent" });

// ------------------ CATEGORIA ------------------

// Una categoria puede pertenecer a una categoria
// 1:N
Category.hasMany(Category, { foreignKey: "_id_parent", as: "children" });
// 1:1
Category.belongsTo(Category, { foreignKey: "_id_parent", as: "parent" });

// Una categoria puede tiene varias empresas
// 1:N
Category.hasMany(Business, { foreignKey: "_id_category" });

// ------------------ IMAGENES ------------------
// Una imagen pertenece a una reseña
// 1:1
ReviewImages.belongsTo(Review, { foreignKey: "_id_review" });

// Una imagen pertenece a un comentario
// 1:1
CommentImages.belongsTo(Comment, { foreignKey: "_id_comment" });
// 1:N
Comment.hasMany(CommentImages, { foreignKey: "_id_comment" });


// ------------------ MENSAJES ------------------
// Un mensaje pertenece a un usuario como remitente/destinatario
// 1:1
Message.belongsTo(User, { foreignKey: "_id_sender", as: "Sender" });
// 1:1
Message.belongsTo(User, { foreignKey: "_id_receiver", as: "Receiver" });


// ------------------ ARTICULOS ------------------

// Un articulo tiene un autor
// 1:1
Article.belongsTo(User, {
    foreignKey: "_id_user",
    as: "Author",
});
