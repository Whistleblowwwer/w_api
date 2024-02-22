import { User } from "../models/users.js"; // Assuming your User model is exported from a file named 'models.js'

// Assuming 'userId' is the ID of the user whose followers you want to retrieve
const getUserFollowers = async (userId) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const followers = await user.getFollowers();
        return followers;
    } catch (error) {
        console.error("Error getting followers:", error);
        throw error;
    }
};

// Example usage:
const userId = "6b56ccce-c731-4242-8901-1f7923c002c6"; // Replace '123' with the actual user ID
getUserFollowers(userId)
    .then((followers) => {
        console.log("Followers:", followers);
    })
    .catch((error) => {
        console.error("Error:", error);
    });
