import Author from "./author.model.js";
import Article from "../articles/article.model.js";
import ApiError from "../../utils/ApiError.js";
import { parsePagination, buildPaginationMeta, slugify, isValidObjectId } from "../../utils/helpers.js";

class AuthorService {
    async getAllAuthors(query) {
        const { page, limit, skip } = parsePagination(query);
        const filter = {};

        if (query.isActive !== undefined) {
            filter.isActive = query.isActive === "true";
        }

        if (query.search) {
            filter.name = { $regex: query.search, $options: "i" };
        }

        const [authors, total] = await Promise.all([
            Author.find(filter)
                .populate("profileImage", "publicUrl altText")
                .populate("user", "name email role")
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Author.countDocuments(filter)
        ]);

        const meta = buildPaginationMeta(total, page, limit);
        return { authors, meta };
    }

    async getAuthorByIdOrSlug(idOrSlug) {
        const query = isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

        const author = await Author.findOne(query)
            .populate("profileImage", "publicUrl altText")
            .populate("user", "name email role")
            .lean();

        if (!author) {
            throw new ApiError(404, "Author not found");
        }

        return author;
    }

    async getAuthorArticles(idOrSlug, query) {
        const author = await this.getAuthorByIdOrSlug(idOrSlug);

        const { page, limit, skip } = parsePagination(query);
        const filter = {
            $or: [{ author: author._id }, { contributors: author._id }],
            status: query.status || "PUBLISHED"
        };

        const [articles, total] = await Promise.all([
            Article.find(filter)
                .populate("category", "name slug")
                .populate("tags", "name slug")
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

    async createAuthor({ user, name, slug, biography, profileImage, socialLinks, isActive }) {
        const finalSlug = slug ? slugify(slug) : slugify(name);
        const existing = await Author.findOne({ slug: finalSlug });
        if (existing) {
            throw new ApiError(409, `Author with slug '${finalSlug}' already exists`);
        }

        if (user) {
            const userAuthor = await Author.findOne({ user });
            if (userAuthor) {
                throw new ApiError(409, "User is already associated with an author profile");
            }
        }

        return await Author.create({
            user: user || undefined,
            name: name.trim(),
            slug: finalSlug,
            biography: biography || "",
            profileImage: profileImage || null,
            socialLinks: socialLinks || {},
            isActive: isActive !== undefined ? isActive : true
        });
    }

    async updateAuthor(id, updateData) {
        const updates = { ...updateData };

        if (updates.slug) {
            updates.slug = slugify(updates.slug);
            const duplicate = await Author.findOne({ slug: updates.slug, _id: { $ne: id } });
            if (duplicate) {
                throw new ApiError(409, `Author with slug '${updates.slug}' already exists`);
            }
        }

        const author = await Author.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        })
            .populate("profileImage", "publicUrl altText")
            .populate("user", "name email role");

        if (!author) {
            throw new ApiError(404, "Author not found");
        }

        return author;
    }

    async deleteAuthor(id) {
        const articleCount = await Article.countDocuments({ author: id });
        if (articleCount > 0) {
            throw new ApiError(400, `Cannot delete author: associated with ${articleCount} article(s)`);
        }

        const author = await Author.findByIdAndDelete(id);
        if (!author) {
            throw new ApiError(404, "Author not found");
        }

        return true;
    }
}

export default new AuthorService();
