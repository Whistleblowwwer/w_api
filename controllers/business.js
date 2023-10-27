import { Business } from "../models/business.js";
import { Review } from "../models/reviews.js";
import { Op } from "sequelize";
import Sequelize from "sequelize";

// Create Business
export const createBusiness = async (req, res) => {
  try {
    const { 
      name, 
      address, 
      state, 
      city 
    } = req.body;

    const _id_user = req.user._id_user;

    const requiredFields = [
      "name", 
      "address", 
      "state", 
      "city"
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).send({ message: `Missing ${field} field` });
      }
    }

    const createdBusiness = await Business.create({
      name,
      address,
      state,
      city,
      _id_user,
    });

    return res.status(201).send({
      message: "Business created successfully",
      business: createdBusiness,
    });
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).send({ 
        message: "Validation error", 
        errors: error.errors 
      });
    } else {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};

// Get Business Details
export const getBusinessDetails = async (req, res) => {
  const { _id_business } = req.params;

  try {
    const business = await Business.findByPk(_id_business);

    if (!business) {
      return res.status(404).send({ message: "Business not found" });
    }

    return res.status(200).send({
      message: "Business retrieved successfully",
      business,
    });
  } catch (error) {
    return res.status(500).send({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

// Get Business List
export const listAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']]
    });

    if (businesses.length === 0) {
      return res.status(404).send({ message: "No businesses found" });
    }

    return res.status(200).send({
      message: "Businesses found successfully",
      businesses
    });

  } catch (error) {
    return res.status(500).send({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

// Get Businesses created by a User
export const getMyBusinesses = async (req, res) => {
    const _id_user = req.user._id_user;

    try {
      const businesses = await Business.findAll({
        where: { _id_user }
      });

      if (businesses.length === 0) {
        return res.status(404).send({ message: "No businesses found" });
      }

      return res.status(200).send({
        message: "Businesses found successfully",
        businesses
      });

    } catch (error) {
      return res.status(500).send({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
};

// Update Business
export const updateBusiness = async (req, res) => {
  try {
    const { 
      name, 
      address, 
      state, 
      city 
    } = req.body;

    const _id_business = req.params._id_business;
    const _id_user = req.user._id_user;

    const businessToUpdate = await Business.findOne({
      where: { _id_business },
    });

    if (!businessToUpdate) {
      return res.status(404).send({ message: "Business not found" });
    }

    if (businessToUpdate._id_user !== _id_user) {
      return res.status(403).send({ message: "You are not authorized to update this business" });
    }

    businessToUpdate.name = name;
    businessToUpdate.address = address;
    businessToUpdate.state = state;
    businessToUpdate.city = city;
    await businessToUpdate.save();

    return res.status(200).send({
      message: "Business updated successfully",
      business: businessToUpdate,
    });
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      return res
        .status(400)
        .send({ 
          message: "Validation error", 
          errors: error.errors 
        });
    } else {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};

// Delete Business
export const deleteBusiness = async (req, res) => {
  try {
    const _id_business = req.params._id_business;
    const _id_user = req.user._id_user;

    const deletedBusiness = await Business.findOne({ where: { _id_business } });

    if (!deletedBusiness) {
      return res.status(404).send({ message: "Business not found" });
    }

    if (deletedBusiness._id_user !== _id_user) {
      return res.status(403).send({ message: "You are not authorized to delete this business"});
    }

    deletedBusiness.is_valid = false;
    await deletedBusiness.save();

    return res.status(200).send({ message: "Business deleted successfully" });
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).send({ 
        message: "Validation error", 
        errors: error.errors 
      });
    } else {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};

// Search Business
export const searchBusiness = async (req, res) => {
  const { 
    name, 
    address, 
    state, 
    city,
    reviewCount 
  } = req.query;

  let searchCriteria = {};

  if (name) {
    searchCriteria.name = { 
      [Op.like]: `%${name}%`
    };
  }
  if (address) {
    searchCriteria.address = {
      [Op.like]: `%${address}%` 
    };
  }
  if (state) {
    searchCriteria.state = {
      [Op.like]: `%${state}%`
    };
  }
  if (city) {
    searchCriteria.city = {
      [Op.like]: `%${city}%`
    };
  }

  try {
    const businesses = await Business.findAll({
      where: searchCriteria,
      include: Review
    });

    if (reviewCount) {
      const filteredBusinesses = businesses.filter(business => 
        business.Reviews && business.Reviews.length >= reviewCount
      );
      return res.status(200).send({ businesses: filteredBusinesses });
    }
    
    return res.status(200).send({ businesses });
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).send({ 
        message: "Validation error", 
        errors: error.errors 
      });
    } else {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};





