//Validate Mail and Phone Number

import { User } from '../models/users.js';

export const isValidEmail = async (email, excludeUserId = null) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //email validation
    if (!regex.test(email)) return false;

    const user = await User.findOne({ where: { email } });
    if (user && user._id_user !== excludeUserId) return false; // If there's a user with this email and it's not the one we're excluding

    return true;
};

export const isValidPhoneNumber = (phoneNumber) => {
    const regex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    return regex.test(phoneNumber);
};
