import { User } from "../models/users.js";

export const updateNicknames = async () => {
    try {
        // Fetch all users
        const allUsers = await User.findAll();

        // Update each user's nickname
        for (const user of allUsers) {
            const newNickname = `${user.name}${user.last_name}${Math.floor(
                1000 + Math.random() * 9000
            )}`;
            const formattedNickname = newNickname.replace(/\s+/g, ""); // Remove spaces
            await user.update({ nick_name: formattedNickname });
        }

        console.log("Nicknames updated successfully!");
    } catch (error) {
        console.error("Error updating nicknames:", error);
        throw error;
    }
};

// Call the function to update nicknames
updateNicknames();
