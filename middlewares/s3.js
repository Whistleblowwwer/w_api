// npm install @aws-sdk/client-s3
const { S3Client } = require("@aws-sdk/client-s3");
// npm install dotenv
const dotenv = require('dotenv')
dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESSS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
})

module.exports = {
    bucketName,
    s3
}