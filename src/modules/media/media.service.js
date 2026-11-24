import crypto from "crypto";
import path from "path";
import Media from "./media.model.js";
import ApiError from "../../utils/ApiError.js";
import { parsePagination, buildPaginationMeta, isValidObjectId } from "../../utils/helpers.js";
import {
    generateR2PresignedUploadUrl,
    deleteR2Object,
    getR2ObjectMetadata,
    getR2PublicUrl
} from "../../config/r2.js";

const MIME_MAP = {
    IMAGE: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
        "image/avif"
    ],
    VIDEO: [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-msvideo",
        "video/mpeg"
    ],
    AUDIO: [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/ogg",
        "audio/aac",
        "audio/webm"
    ],
    DOCUMENT: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/csv"
    ]
};

const detectMediaType = (mimeType) => {
    const normalized = mimeType.toLowerCase();
    for (const [type, mimes] of Object.entries(MIME_MAP)) {
        if (mimes.includes(normalized)) {
            return type;
        }
    }
    if (normalized.startsWith("image/")) return "IMAGE";
    if (normalized.startsWith("video/")) return "VIDEO";
    if (normalized.startsWith("audio/")) return "AUDIO";
    return "DOCUMENT";
};

const generateR2Key = (originalName, mediaType = "IMAGE") => {
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const uniqueHash = crypto.randomBytes(6).toString("hex");

    const ext = path.extname(originalName).toLowerCase();
    const nameWithoutExt = path.basename(originalName, ext)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 50);

    const folder = mediaType.toLowerCase() + "s";
    return `media/${folder}/${year}/${month}/${uniqueHash}-${nameWithoutExt}${ext}`;
};

class MediaService {
    async createPresignedUploadSession({
        fileName,
        mimeType,
        mediaType,
        sizeBytes,
        altText = "",
        caption = "",
        width,
        height,
        durationSeconds,
        uploadedBy
    }) {
        const detectedType = mediaType || detectMediaType(mimeType);

        const allowedMimes = MIME_MAP[detectedType];
        if (allowedMimes && !allowedMimes.includes(mimeType.toLowerCase())) {
            throw new ApiError(400, `MIME type '${mimeType}' is not supported for mediaType '${detectedType}'`);
        }

        const storageKey = generateR2Key(fileName, detectedType);
        const publicUrl = getR2PublicUrl(storageKey);

        const media = await Media.create({
            originalName: fileName,
            mimeType: mimeType.toLowerCase(),
            mediaType: detectedType,
            storageProvider: "R2",
            storageKey,
            publicUrl,
            sizeBytes: sizeBytes || 0,
            width: width || null,
            height: height || null,
            durationSeconds: durationSeconds || null,
            altText,
            caption,
            uploadedBy,
            isActive: false
        });

        const expiresInSeconds = 900;
        const uploadUrl = await generateR2PresignedUploadUrl({
            key: storageKey,
            mimeType,
            expiresInSeconds
        });

        return {
            media,
            upload: {
                uploadUrl,
                storageKey,
                publicUrl,
                expiresInSeconds,
                method: "PUT",
                headers: {
                    "Content-Type": mimeType
                }
            }
        };
    }

    async confirmMediaUpload(mediaId, { width, height, durationSeconds } = {}) {
        const media = await Media.findById(mediaId);
        if (!media) {
            throw new ApiError(404, "Media not found");
        }

        if (media.storageProvider === "R2") {
            const r2Meta = await getR2ObjectMetadata(media.storageKey);
            if (!r2Meta) {
                throw new ApiError(400, "File has not yet been uploaded to Cloudflare R2 or is not accessible");
            }

            if (r2Meta.ContentLength) {
                media.sizeBytes = r2Meta.ContentLength;
            }
        }

        media.isActive = true;
        if (width) media.width = width;
        if (height) media.height = height;
        if (durationSeconds) media.durationSeconds = durationSeconds;

        await media.save();
        return media;
    }

    async getAllMedia(query) {
        const { page, limit, skip } = parsePagination(query);
        const filter = {};

        if (query.mediaType) {
            filter.mediaType = query.mediaType.toUpperCase();
        }

        if (query.storageProvider) {
            filter.storageProvider = query.storageProvider.toUpperCase();
        }

        if (query.uploadedBy && isValidObjectId(query.uploadedBy)) {
            filter.uploadedBy = query.uploadedBy;
        }

        if (query.isActive !== undefined) {
            filter.isActive = query.isActive === "true";
        } else if (!query.all) {
            filter.isActive = true;
        }

        if (query.search) {
            filter.$or = [
                { originalName: { $regex: query.search, $options: "i" } },
                { altText: { $regex: query.search, $options: "i" } },
                { caption: { $regex: query.search, $options: "i" } }
            ];
        }

        const [media, total] = await Promise.all([
            Media.find(filter)
                .populate("uploadedBy", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Media.countDocuments(filter)
        ]);

        const meta = buildPaginationMeta(total, page, limit);
        return { media, meta };
    }

    async getMediaById(id) {
        const media = await Media.findById(id)
            .populate("uploadedBy", "name email")
            .lean();

        if (!media) {
            throw new ApiError(404, "Media file not found");
        }

        return media;
    }

    async updateMedia(id, data) {
        const { altText, caption, width, height, isActive } = data;
        const updates = {};

        if (altText !== undefined) updates.altText = altText;
        if (caption !== undefined) updates.caption = caption;
        if (width !== undefined) updates.width = width;
        if (height !== undefined) updates.height = height;
        if (isActive !== undefined) updates.isActive = isActive;

        const media = await Media.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        }).populate("uploadedBy", "name email");

        if (!media) {
            throw new ApiError(404, "Media not found");
        }

        return media;
    }

    async removeMedia(mediaId) {
        const media = await Media.findById(mediaId);
        if (!media) {
            throw new ApiError(404, "Media not found");
        }

        if (media.storageProvider === "R2" && media.storageKey) {
            try {
                await deleteR2Object(media.storageKey);
            } catch (err) {
                console.error(`Failed to delete object '${media.storageKey}' from R2:`, err.message);
            }
        }

        await Media.findByIdAndDelete(mediaId);
        return true;
    }
}

export default new MediaService();
