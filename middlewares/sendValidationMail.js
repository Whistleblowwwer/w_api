import NodeCache from "node-cache";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const otpCache = new NodeCache({ stdTTL: 300 });

// const transporter = nodemailer.createTransport({
//     host: "smtp.hostinger.com",
//     secure: true,
//     secureConnection: false,
//     tls: {
//         ciphers: "SSLv3",
//     },
//     requireTLS: true,
//     port: 465,
//     debug: true,
//     connectionTimeout: 10000,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    secure: true, 
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});


function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit OTP
}

export const sendOTPByEmail = (email) => {
    return new Promise((resolve, reject) => {
        // Generate OTP
        const otp = generateOTP();

        const htmlTemplate = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Code Mail</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        text-align: center;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }

                    .container {
                        max-width: 600px;
                        margin: 50px auto;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }

                    .code {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333333;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <p>Tu código de autenticación es:</p>
                    <div class="code">${otp}</div>
                    <p>No se lo compartas a nadie y usalo para completar el registro de tu cuenta.</p>
                </div>
            </body>
            </html>
        `;

        // Store OTP in cache with the user's email as the key
        otpCache.set(email, { otp, timestamp: Date.now() });

        // Configure email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP for Account Verification",
            html: htmlTemplate,
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                reject("Failed to send OTP email.");
            } else {
                console.log("Email sent: " + info.response);
                resolve(info);
            }
        });
    });
};

// Function to validate OTP
export const validateOTP = (email, enteredOTP) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return false;
    }
    console.log("\n -- CACHE: ", otpCache);
    const storedData = otpCache.get(email);
    console.log("\n -- STORED DATA: ", storedData);

    if (storedData.otp === enteredOTP) {
        const timeDifference = Date.now() - storedData.timestamp;
        if (timeDifference < 300000) {
            // Valid OTP
            return true;
        }
        return true;
    }

    // Invalid OTP or expired
    return false;
};
