import dns from 'dns/promises';

export const isValidEmail = async (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return false;

    const domain = email.split('@')[1];
    try {
        const mxRecords = await dns.resolveMx(domain);
        return mxRecords && mxRecords.length > 0;
    } catch (error) {
        console.error(`Error resolving MX records for domain ${domain}:`, error);
        return false;
    }
};

export const isValidPhoneNumber = (phoneNumber) => {
    const regex = /^(\+?52\s?(1\s?)?)?(\d{2}[-\s]?\d{4}[-\s]?\d{4})$/;
    return regex.test(phoneNumber);
};
