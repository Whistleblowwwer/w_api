export const isValidEmail = async (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return false;

    return true;
};

export const isValidPhoneNumber = (phoneNumber) => {
    const regex = /^(\+?52\s?(1\s?)?)?(\d{2}[-\s]?\d{4}[-\s]?\d{4})$/;
    return regex.test(phoneNumber);
};