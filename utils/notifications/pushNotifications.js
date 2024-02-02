import { User } from "../../models/users.js";

export const mapFCM = async (FCM, _id_user) => {
    try {
        // Find the user by primary key (_id_user)
        const user = await User.findByPk(_id_user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.fcmtoken = FCM; // Assuming the column name is 'fcmtoken'. Adjust if needed.

        await user.save();

        return res.status(201).json({
            message: "FCM saved successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
