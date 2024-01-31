import serviceAccount from "../config/whistleblowwer-notificaciones-firebase-adminsdk-pwr18-e3015a8fed.json" assert { type: "json" };
import admin from "firebase-admin";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// This registration token comes from the client FCM SDKs.
const registrationToken =
    "fw53HZXZUELlh0bsEsDNb3:APA91bE-adzTRrp57prfhRP7LI8tJvvDW3Ge2qr1e6319rWzZvIpVKfRZmK_-rPjBdMgeV_waX2piLt7By_HRq3aHfTYCfldex9__pLzZkmwfaT_CndV3uuQ1YVretNn2_7E5OOza86E";

const message = {
    notification: {
        title: "Log in succesful",
        body: "Welcome ome gonorrea",
    },
    data: {
        content: "lol",
    },
    token: registrationToken,
};

// Send a message to the device corresponding to the provided registration token.
admin
    .messaging()
    .send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log("Successfully sent message:", response);
    })
    .catch((error) => {
        console.log("Error sending message:", error);
    });
