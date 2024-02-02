import dotenv from "dotenv";
import twilio from "twilio";
dotenv.config();

const client = twilio(
    process.env.ACCOUNTSID,
    process.env.AUTHTOKENTWILIO
);

export function sendOTP(phoneNumber) {
    console.log("activado sms");
    console.log(phoneNumber);
    return client.verify.v2
        .services(process.env.VERIFYSID)
        .verifications.create({ to: phoneNumber, channel: "sms" });
}

export function verifyOTP(phoneNumber, otpCode) {
    console.log("Llamado de verificacion de sms");
    console.log(phoneNumber);
    return client.verify.v2
        .services(process.env.VERIFYSID)
        .verificationChecks.create({ to: phoneNumber, code: otpCode });
}