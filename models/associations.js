import { User } from "./users.js";
import { Business } from "./business.js";
import { Review } from "./reviews.js";
import { Comment } from "./comments.js";

// Associations

// 1. Un user puede seguir a otro usuario
User.belongsToMany(User, { as: 'Followers', through: 'userFollowers', foreignKey: 'userId', otherKey: 'followerId' });

// 2. Un user puede crear y seguir a una empresa
User.hasMany(Business, { foreignKey: '_id_user' }); 
User.belongsToMany(Business, { as: 'FollowedBusinesses', through: 'businessFollowers', foreignKey: 'userId', otherKey: 'businessId' }); 

// 3. Una empresa puede tener 0 o varios reviews
Business.hasMany(Review, { foreignKey: '_id_business' });

// 4. Un review puede tener 0 o varios comments
Review.hasMany(Comment, { foreignKey: '_id_review' });

// 5. Una empresa puede tener seguidores
Business.belongsToMany(User, { as: 'Followers', through: 'businessFollowers', foreignKey: 'businessId', otherKey: 'userId' });

// 6. Un user puede hacer un review
User.hasMany(Review, { foreignKey: '_id_user' });

