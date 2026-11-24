import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "./environment.js";

const r2Client = new S3Client({
    region: "auto",
    endpoint: env.R2_ACCOUNT_ID
        ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
        : undefined,
    credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY
    }
});

/**
 * Generate a presigned PUT URL for direct client-to-R2 upload
 */
export const generateR2PresignedUploadUrl = async ({ key, mimeType, expiresInSeconds = 900 }) => {
    const command = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        ContentType: mimeType
    });

    return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
};

/**
 * Delete an object from Cloudflare R2
 */
export const deleteR2Object = async (key) => {
    if (!key || !env.R2_BUCKET_NAME) return;
    const command = new DeleteObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key
    });
    return await r2Client.send(command);
};

/**
 * Verify whether an object exists in Cloudflare R2 and retrieve its metadata
 */
export const getR2ObjectMetadata = async (key) => {
    if (!key || !env.R2_BUCKET_NAME) return null;
    try {
        const command = new HeadObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key
        });
        return await r2Client.send(command);
    } catch (err) {
        if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
            return null;
        }
        throw err;
    }
};

/**
 * Construct public CDN URL for an R2 storage key
 */
export const getR2PublicUrl = (key) => {
    if (!key) return null;
    const base = env.R2_PUBLIC_URL.replace(/\/+$/, "");
    return `${base}/${key.replace(/^\/+/, "")}`;
};

export default r2Client;
