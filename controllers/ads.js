import { Ad } from "../models/ads.js";
import { User } from "../models/users.js";
import { Banner } from "../models/banners.js";
import { Review } from "../models/reviews.js";
import { sequelize_write } from "../config/db_write.js";

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
            type,
            index_position, // New fields for banners
            location, // New fields for banners
            _id_business, // Added field for linking ad to business
        } = req.body;

        // Check for missing fields
        if (type === "Banner" && (!location || !index_position)) {
            return res.status(400).json({
                message: "Location and index_position are required for banners",
            });
        }

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

        // Create the ad and the review in a transaction
        const createdAd = await sequelize_write.transaction(async (t) => {
            let ad;
            if (type === "Review") {
                // If the type is Review, create a review and associate the ad with it
                const { content, rating } = req.body;

                // Check for missing fields for Review type
                if (!content) {
                    return res.status(400).json({
                        message: "Content and rating are required for reviews",
                    });
                }

                // Create the ad associated with the review
                ad = await Ad.create(
                    {
                        title,
                        description,
                        start_campaign_date,
                        end_campaign_date,
                        clickUrl,
                        status,
                        _id_user,
                        type,
                        _id_business,
                    },
                    { transaction: t }
                );

                // Create the review
                const review = await Review.create(
                    {
                        content,
                        _id_business,
                        _id_user,
                        _id_ad: ad._id_ad,
                    },
                    { transaction: t }
                );
            } else {
                // If the type is Banner, create the ad normally
                ad = await Ad.create(
                    {
                        title,
                        description,
                        imageUrl,
                        start_campaign_date,
                        end_campaign_date,
                        clickUrl,
                        status,
                        _id_user,
                        type,
                        _id_business,
                    },
                    { transaction: t }
                );

                // If type is banner, create the corresponding banner entry
                if (type === "Banner") {
                    await Banner.create(
                        {
                            location,
                            index_position,
                            _id_ad: ad._id_ad, // Associate the banner with the created ad
                        },
                        { transaction: t }
                    );
                }
            }

            return ad;
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
                    attributes: ["name", "email"],
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

export const getAdsByType = async (req, res) => {
    const adType = req.params.type; // Assuming the route parameter is named 'type'

    try {
        let ads;
        if (adType === "Banner") {
            // If the requested type is banner, fetch all banners and organize them by location
            const banners = await Banner.findAll({
                where: {
                    is_valid: true, // Filter only valid banners
                },
                include: [
                    {
                        model: Ad,
                        where: { type: adType },
                    },
                ],
                order: [
                    ["location", "ASC"],
                    ["index_position", "ASC"],
                ],
            });

            // Initialize an object to hold banners organized by location
            const organizedBanners = {};

            // Organize banners by location
            banners.forEach((banner) => {
                if (!organizedBanners[banner.location]) {
                    organizedBanners[banner.location] = [];
                }
                organizedBanners[banner.location].push(banner);
            });

            // Format the response
            ads = organizedBanners;
        } else {
            // For other types, fetch ads normally
            ads = await Ad.findAll({
                where: {
                    type: adType,
                    is_valid: true, // Filter only valid ads
                    status: "active", // Filter only active ads
                },
                include: {
                    model: User,
                    attributes: ["name", "email"],
                },
            });
        }

        return res.status(200).json(ads);
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
