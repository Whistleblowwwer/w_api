import { Ad } from "../models/ads.js"; // Assuming the model file is named "ad.js"
import { User } from "../models/users.js"; // Assuming the model file is named "user.js"

// Controller to create the Ad
export const createAd = async (req, res) => {
    const adminId = req.user._id_user;
    const admin = await User.findByPk(adminId);

    try {
        // Check if the user is an admin
        if (admin.role !== "admin") {
            return res.status(403).json({
                message: "Permission denied. Only admins can create ads.",
            });
        }

        // Extract data from req.body
        const {
            title,
            description,
            imageUrl,
            start_campaign_date: rawStartDate,
            end_campaign_date: rawEndDate,
            clickUrl,
            _id_user,
            type, // Added type extraction
        } = req.body;

        // Parse start_campaign_date and end_campaign_date into Date objects if they're not already
        const start_campaign_date =
            rawStartDate instanceof Date
                ? rawStartDate
                : new Date(rawStartDate);
        const end_campaign_date =
            rawEndDate instanceof Date ? rawEndDate : new Date(rawEndDate);

        // Check if start_campaign_date is before or equal to current date
        const currentDate = new Date();
        const status = start_campaign_date <= currentDate ? "active" : "paused";

        // Check if end_campaign_date is at least 24 hours from start_campaign_date
        const timeDifference =
            end_campaign_date.getTime() - start_campaign_date.getTime();
        const durationInHours = timeDifference / (1000 * 3600);
        if (durationInHours < 24) {
            return res.status(400).json({
                message:
                    "End campaign date must be at least 24 hours after start campaign date.",
            });
        }

        // Create the ad
        const createdAd = await Ad.create({
            title,
            description,
            imageUrl,
            start_campaign_date,
            end_campaign_date,
            clickUrl,
            status,
            _id_user,
            type,
        });

        return res.status(201).json({
            message: "Ad created successfully",
            ad: createdAd,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Controller for reading all valid and active ads
export const getAllActiveAds = async (req, res) => {
    try {
        const ads = await Ad.findAll({
            where: {
                status: "active",
                is_valid: true,
            },
            include: [
                {
                    model: User,
                    attributes: ["name", "email"], // Include user information if needed
                },
            ],
        });

        return res.status(200).json(ads);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Controller for reading an ad by id
export const getAdById = async (req, res) => {
    const { id } = req.params;

    try {
        const ad = await Ad.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ["name", "email"], // Include user information if needed
                },
            ],
        });

        if (!ad) {
            return res.status(404).json({ message: "Ad not found" });
        }

        return res.status(200).json(ad);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllBannerAds = async (req, res) => {
    try {
        // Find all ads with type 'Banner'
        const bannerAds = await Ad.findAll({
            where: {
                type: "Banner",
            },
        });

        return res.status(200).json({
            message: "Banner ads retrieved successfully",
            ads: bannerAds,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Controller for updating an ad
export const updateAd = async (req, res) => {
    const adminId = req.user._id_user;
    const admin = await User.findByPk(adminId);

    try {
        // Check if the user is an admin
        if (admin.role !== "admin") {
            return res.status(403).json({
                message: "Permission denied. Only admins can update ads.",
            });
        }

        // Extract data from req.body
        const { start_campaign_date, end_campaign_date, clickUrl } = req.body;

        // Check if the ad exists
        const { id } = req.params;
        const ad = await Ad.findByPk(id);
        if (!ad) {
            return res.status(404).json({ message: "Ad not found" });
        }

        // Update the ad
        await ad.update({
            start_campaign_date,
            end_campaign_date,
            clickUrl,
        });

        return res.status(200).json({ message: "Ad updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Controller for soft deleting an ad
export const deleteAd = async (req, res) => {
    const adminId = req.user._id_user;
    const admin = await User.findByPk(adminId);

    try {
        // Check if the user is an admin
        if (admin.role !== "admin") {
            return res.status(403).json({
                message: "Permission denied. Only admins can delete ads.",
            });
        }

        // Check if the ad exists
        const { id } = req.params;
        const ad = await Ad.findByPk(id);
        if (!ad) {
            return res.status(404).json({ message: "Ad not found" });
        }

        // Soft delete the ad
        await ad.update({ is_valid: false });

        return res.status(200).json({ message: "Ad deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
