// import { User } from "../models/users.js";
// import { BusinessFollowers } from "../models/businessFollowers.js";
import { Business } from "../models/business.js";
// import { Op } from 'sequelize';

export const createBusiness = async (req, res) => {
    const { name, address, state, city } = req.body;
    const _id_user = req.user._id_user; // Getting ID from validateToken middleware

    try {
        const business = await Business.create({
            name,
            address,
            state,
            city,
            _id_user //Tracking who created the business
        });

        return res.status(201).send({ message: "Business created successfully", business });

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

export const updateBusiness = async (req, res) => {
    const { name, address, state, city } = req.body;
    const _id_business = req.params._id_business;
    const _id_user = req.user._id_user; // Getting ID from validateToken middleware

    try {
        // Find busineess with business id
        const business = await Business.findOne({ where: { _id_business } });

        if (!business) {
            return res.status(404).send({ message: "Business not found" });
        }

        // Only user that created the business can modify it
        if (business._id_user !== _id_user) {
            return res.status(403).send({ message: "You are not authorized to update this business" });
        }

        // Update the new values
        business.name = name;
        business.address = address;
        business.state = state;
        business.city = city;
        await business.save();

        return res.status(200).send({ message: "Business updated successfully", business });

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};


export const deleteBusiness = async (req, res) => {
    const _id_business = req.params._id_business;
    const _id_user = req.user._id_user; // Getting ID from validateToken middleware

    try {
        const business = await Business.findOne({ where: { _id_business } });

        if (!business) {
            return res.status(404).send({ message: "Business not found" });
        }
        // Only user that created the business can delete it
        if (business._id_user !== _id_user) { 
            return res.status(403).send({ message: "You are not authorized to delete this business" });
        }
        //Not valid anymore
        business.is_valid = false;
        await business.save();

        return res.status(200).send({ message: "Business marked as invalid successfully" });

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};
