import Newsletter from "./newsletter.model.js";
import ApiError from "../../utils/ApiError.js";
import { parsePagination, buildPaginationMeta } from "../../utils/helpers.js";

class NewsletterService {
    async getAllSubscribers(query) {
        const { page, limit, skip } = parsePagination(query);
        const filter = {};

        if (query.status) {
            filter.status = query.status.toUpperCase();
        }

        if (query.source) {
            filter.source = query.source;
        }

        if (query.search) {
            filter.email = { $regex: query.search, $options: "i" };
        }

        const [subscribers, total] = await Promise.all([
            Newsletter.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Newsletter.countDocuments(filter)
        ]);

        const meta = buildPaginationMeta(total, page, limit);
        return { subscribers, meta };
    }

    async subscribe({ email, source }) {
        const normalizedEmail = email.toLowerCase().trim();
        let subscriber = await Newsletter.findOne({ email: normalizedEmail });

        if (subscriber) {
            if (subscriber.status === "ACTIVE") {
                return { subscriber, alreadySubscribed: true };
            }

            subscriber.status = "ACTIVE";
            subscriber.unsubscribedAt = null;
            subscriber.subscribedAt = new Date();
            if (source) subscriber.source = source;
            await subscriber.save();

            return { subscriber, resubscribed: true };
        }

        subscriber = await Newsletter.create({
            email: normalizedEmail,
            status: "ACTIVE",
            source: source || "WEBSITE",
            subscribedAt: new Date()
        });

        return { subscriber, created: true };
    }

    async unsubscribe(email) {
        const normalizedEmail = email.toLowerCase().trim();
        const subscriber = await Newsletter.findOne({ email: normalizedEmail });

        if (!subscriber) {
            throw new ApiError(404, "Subscriber not found");
        }

        subscriber.status = "UNSUBSCRIBED";
        subscriber.unsubscribedAt = new Date();
        await subscriber.save();

        return true;
    }

    async updateStatus(id, status) {
        const updates = { status: status.toUpperCase() };
        if (updates.status === "UNSUBSCRIBED") {
            updates.unsubscribedAt = new Date();
        } else if (updates.status === "ACTIVE") {
            updates.confirmedAt = new Date();
        }

        const subscriber = await Newsletter.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!subscriber) {
            throw new ApiError(404, "Subscriber not found");
        }

        return subscriber;
    }

    async deleteSubscriber(id) {
        const subscriber = await Newsletter.findByIdAndDelete(id);
        if (!subscriber) {
            throw new ApiError(404, "Subscriber not found");
        }
        return true;
    }
}

export default new NewsletterService();
