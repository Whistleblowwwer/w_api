import { BusinessFollowers } from "./businessFollowers.js";
import { UserFollowers } from "./userFollowers.js";
import { CommentImages } from "./commentImages.js";
import { ReviewImages } from "./reviewImages.js";
import { CommentLikes } from "./commentLikes.js";
import { Notification } from "./notifications.js";
import { ReviewLikes } from "./reviewLikes.js";
import { Category } from "./categories.js";
import { ErrorLog } from "./errorsLogs.js";
import { Business } from "./business.js";
import { Log } from "./requestsLogs.js";
import { Article } from "./articles.js";
import { Message } from "./messages.js";
import { Comment } from "./comments.js";
import { UserIps } from "./userIps.js";
import { Review } from "./reviews.js";
import { Banner } from "./banners.js";
import { Topic } from "./topics.js";
import { UserTopicSubscription } from "./userTopicSubscriptions.js";
import { User } from "./users.js";
import { Ad } from "./ads.js";
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

// Un usuario puede tener varias logs de peticiones
// 1:N
User.hasMany(Log, { foreignKey: "_id_user" });

// Un usuario puede tener varias logs de errores
// 1:N
User.hasMany(ErrorLog, { foreignKey: "_id_user" });

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

// Un usuario puede ser el remitente de muchas notificaciones
// 1:N
User.belongsToMany(Notification, {
    as: "SentNotifications",
    through: Notification,
    foreignKey: "_id_user_sender",
    otherKey: "_id_notification",
});

// Un usuario puede ser el destinatario de muchas notificaciones
// 1:N
User.belongsToMany(Notification, {
    as: "ReceivedNotifications",
    through: Notification,
    foreignKey: "_id_user_receiver",
    otherKey: "_id_notification",
});

// Un usuario puede ser dueño de varias pautas
// 1:N
User.hasMany(Ad, {
    foreignKey: "_id_user",
});

// Varios topicos pueden pertenecer a varios usuarios
// N:N
User.belongsToMany(Topic, {
    through: UserTopicSubscription,
    foreignKey: "_id_user",
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
    as: "businessFollowers",
    through: BusinessFollowers,
    foreignKey: "_id_business",
    otherKey: "_id_user",
});

// Un business tiene una categoria
// 1:1
Business.belongsTo(Category, { foreignKey: "_id_category" });

// Una empresa puede tener muchas pautas
// 1:N
Business.hasMany(Ad, { foreignKey: "_id_business" });

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

// Una reseña pertenece a una pauta
// 1:N
Review.belongsTo(Ad, {
    foreignKey: "_id_ad",
});
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
Comment.hasMany(Comment, { as: "children", foreignKey: "_id_parent" });

// Un comentario puede tener un comentario padre
// 1:1
Comment.belongsTo(Comment, { as: "parent", foreignKey: "_id_parent" });

// ------------------ CATEGORIA ------------------

// Una categoria puede pertenecer a una categoria
// 1:N
Category.hasMany(Category, { foreignKey: "_id_parent", as: "children" });
// 1:1
Category.belongsTo(Category, { foreignKey: "_id_parent", as: "parent" });

// Una categoria puede tiene varias empresas
// 1:N
Category.hasMany(Business, { foreignKey: "_id_category" });

// ------------------ IMAGES ------------------
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
// Un articulo pertenece a una categoria
// 1:1
Article.belongsTo(Category, {
    foreignKey: "_id_category",
});

// ------------------ BUSINESSFOLLOWERS ------------------
// Asociación inversa de M:N con Business
User.belongsToMany(Business, {
    as: "followedBusinesses",
    through: BusinessFollowers,
    foreignKey: "_id_user",
    otherKey: "_id_business",
});

BusinessFollowers.belongsTo(User, { foreignKey: "_id_user" });
BusinessFollowers.belongsTo(Business, { foreignKey: "_id_business" });

// ------------------ LOGS ------------------
// Un Request Log puede tener opcional un usuario
// 1:1
Log.belongsTo(User, {
    foreignKey: "_id_user",
});

// Un Error Log puede tener opcional un usuario
// 1:1
ErrorLog.belongsTo(User, {
    foreignKey: "_id_user",
});

// ---------------- USER IPS ------------------

User.hasMany(UserIps, { foreignKey: "_id_user" });
UserIps.belongsTo(User, { foreignKey: "_id_user" });

// ------------------ ADS ------------------
// Una pauta pertenece a un usuario
// 1:1
Ad.belongsTo(User, {
    foreignKey: "_id_user",
});

// Una pauta puede tener varias reseñas
// 1:N
Ad.hasMany(Review, { foreignKey: "_id_ad" });

// Una pauta puede tener varios banner
// 1:N
Ad.hasMany(Banner, { foreignKey: "_id_ad" });

// Una pauta pertenece a un negocio
// 1:1
Ad.belongsTo(Business, { foreignKey: "_id_business" });

// ------------------ BANNERS ------------------
// Una banner pertenece a una pauta
// 1:1
Banner.belongsTo(Ad, { foreignKey: "_id_ad" });

// ------------------ NOTIFICATIONS ------------------
// Varios usuarios pueden suscribirse a varios topicos
// N:N
Topic.belongsToMany(User, {
    through: UserTopicSubscription,
    foreignKey: "_id_topic",
});

// ----------------- DEBUG -------------------
console.log("\n -- USER ASSOCIATIONS: ", User.associations);
console.log("\n -- REVIEW ASSOCIATIONS: ", Review.associations);
console.log("\n -- ADS ASSOCIATIONS: ", Ad.associations);
