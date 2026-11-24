import Tag from "./tags.model.js";
import Article from "../articles/article.model.js";
import ApiError from "../../utils/ApiError.js";
import { parsePagination, buildPaginationMeta, slugify, isValidObjectId } from "../../utils/helpers.js";

class TagService {
    async getAllTags(query) {
        const { page, limit, skip } = parsePagination(query);
        const filter = {};

        if (query.isActive !== undefined) {
            filter.isActive = query.isActive === "true";
        }

        if (query.search) {
            filter.name = { $regex: query.search, $options: "i" };
        }

        const [tags, total] = await Promise.all([
            Tag.find(filter)
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Tag.countDocuments(filter)
        ]);

        const meta = buildPaginationMeta(total, page, limit);
        return { tags, meta };
    }

    async getTagByIdOrSlug(idOrSlug) {
        const query = isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

        const tag = await Tag.findOne(query).lean();
        if (!tag) {
            throw new ApiError(404, "Tag not found");
        }

        return tag;
    }

    async getTagArticles(idOrSlug, query) {
        const tag = await this.getTagByIdOrSlug(idOrSlug);

        const { page, limit, skip } = parsePagination(query);
        const filter = {
            tags: tag._id,
            status: query.status || "PUBLISHED"
        };

        const [articles, total] = await Promise.all([
            Article.find(filter)
                .populate("author", "name slug profileImage")
                .populate("category", "name slug")
                .populate("featuredImage", "publicUrl altText")
                .sort({ publishedAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Article.countDocuments(filter)
        ]);

        const meta = buildPaginationMeta(total, page, limit);
        return { articles, meta };
    }

    async createTag({ name, slug, description, isActive }) {
        const finalSlug = slug ? slugify(slug) : slugify(name);
        const existing = await Tag.findOne({ slug: finalSlug });
        if (existing) {
            throw new ApiError(409, `Tag with slug '${finalSlug}' already exists`);
        }

        return await Tag.create({
            name: name.trim(),
            slug: finalSlug,
            description: description || "",
            isActive: isActive !== undefined ? isActive : true
        });
    }

    async updateTag(id, updateData) {
        const updates = { ...updateData };

        if (updates.slug) {
            updates.slug = slugify(updates.slug);
            const duplicate = await Tag.findOne({ slug: updates.slug, _id: { $ne: id } });
            if (duplicate) {
                throw new ApiError(409, `Tag with slug '${updates.slug}' already exists`);
            }
        }

        const tag = await Tag.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!tag) {
            throw new ApiError(404, "Tag not found");
        }

        return tag;
    }

    async deleteTag(id) {
        const tag = await Tag.findByIdAndDelete(id);
        if (!tag) {
            throw new ApiError(404, "Tag not found");
        }
        return true;
    }
}

export default new TagService();
