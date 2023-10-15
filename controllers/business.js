import { Business } from "../models/business.js";

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
      businessUpdated: businessToUpdate,
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

    return res.status(200).send({ message: "Business marked as invalid successfully" });
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
