import Article from "./article.model.js";
import Author from "../authors/author.model.js";
import Category from "../categories/category.model.js";
import Comment from "../comments/comments.model.js";
import ApiError from "../../utils/ApiError.js";
import { parsePagination, buildPaginationMeta, slugify, isValidObjectId } from "../../utils/helpers.js";

const calculateReadingTime = (content) => {
    let text = "";
    if (typeof content === "string") {
        text = content;
    } else if (typeof content === "object" && content !== null) {
        text = JSON.stringify(content);
    }
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
};

class ArticleService {
    async getAllArticles(query) {
        const { page, limit, skip } = parsePagination(query);
        const filter = {};

        if (query.status) {
            filter.status = query.status.toUpperCase();
        } else if (!query.all) {
            filter.status = "PUBLISHED";
        }

        if (query.category) {
            if (isValidObjectId(query.category)) {
                filter.category = query.category;
            } else {
                const cat = await Category.findOne({ slug: query.category.toLowerCase() });
                if (cat) filter.category = cat._id;
            }
        }

        if (query.tag && isValidObjectId(query.tag)) {
            filter.tags = query.tag;
        }

        if (query.author && isValidObjectId(query.author)) {
            filter.author = query.author;
        }

        if (query.isFeatured !== undefined) {
            filter.isFeatured = query.isFeatured === "true";
        }

        if (query.isBreaking !== undefined) {
            filter.isBreaking = query.isBreaking === "true";
        }

        if (query.search) {
            filter.$or = [
                { title: { $regex: query.search, $options: "i" } },
                { excerpt: { $regex: query.search, $options: "i" } }
            ];
        }

        const sortField = query.sortBy || "publishedAt";
        const sortOrder = query.order === "asc" ? 1 : -1;
        const sortOptions = { [sortField]: sortOrder, createdAt: -1 };

        const [articles, total] = await Promise.all([
            Article.find(filter)
                .populate("author", "name slug profileImage biography")
                .populate("category", "name slug")
                .populate("tags", "name slug")
                .populate("featuredImage", "publicUrl altText caption")
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            Article.countDocuments(filter)
        ]);

        const meta = buildPaginationMeta(total, page, limit);
        return { articles, meta };
    }

    async getBreakingNews(limitParam = 5) {
        const limit = Math.min(20, Math.max(1, parseInt(limitParam, 10) || 5));

        return await Article.find({
            status: "PUBLISHED",
            isBreaking: true
        })
            .select("title slug excerpt publishedAt readingTimeMinutes category featuredImage")
            .populate("category", "name slug")
            .populate("featuredImage", "publicUrl altText")
            .sort({ publishedAt: -1 })
            .limit(limit)
            .lean();
    }

    async getFeaturedArticles(limitParam = 6) {
        const limit = Math.min(20, Math.max(1, parseInt(limitParam, 10) || 6));

        return await Article.find({
            status: "PUBLISHED",
            isFeatured: true
        })
            .populate("author", "name slug profileImage")
            .populate("category", "name slug")
            .populate("tags", "name slug")
            .populate("featuredImage", "publicUrl altText caption")
            .sort({ publishedAt: -1 })
            .limit(limit)
            .lean();
    }

    async getArticleByIdOrSlug(idOrSlug) {
        const query = isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

        const article = await Article.findOneAndUpdate(query, { $inc: { viewCount: 1 } }, { new: true })
            .populate("author", "name slug profileImage biography socialLinks")
            .populate("contributors", "name slug profileImage")
            .populate("category", "name slug description")
            .populate("tags", "name slug")
            .populate("featuredImage", "publicUrl altText caption width height")
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email");

        if (!article) {
            throw new ApiError(404, "Article not found");
        }

        return article;
    }

    async createArticle(data, userId) {
        const {
            title,
            slug,
            excerpt,
            content,
            author,
            contributors,
            category,
            tags,
            featuredImage,
            status,
            isFeatured,
            isBreaking,
            publishedAt,
            scheduledAt,
            readingTimeMinutes,
            seo
        } = data;

        // Resolve author: use passed author or find author profile for current user
        let authorId = author;
        if (!authorId && userId) {
            const authorProfile = await Author.findOne({ user: userId });
            if (authorProfile) authorId = authorProfile._id;
        }

        if (!authorId) {
            throw new ApiError(400, "Author is required. Provide an author ID or create an Author profile first");
        }

        const finalSlug = slug ? slugify(slug) : slugify(title);
        const existing = await Article.findOne({ slug: finalSlug });
        if (existing) {
            throw new ApiError(409, `Article with slug '${finalSlug}' already exists`);
        }

        const finalReadingTime = readingTimeMinutes || calculateReadingTime(content);
        const articleStatus = status || "DRAFT";
        let finalPublishedAt = publishedAt || null;

        if (articleStatus === "PUBLISHED" && !finalPublishedAt) {
            finalPublishedAt = new Date();
        }

        const article = await Article.create({
            title,
            slug: finalSlug,
            excerpt,
            content,
            author: authorId,
            contributors: contributors || [],
            category,
            tags: tags || [],
            featuredImage: featuredImage || null,
            status: articleStatus,
            isFeatured: isFeatured || false,
            isBreaking: isBreaking || false,
            publishedAt: finalPublishedAt,
            scheduledAt: scheduledAt || null,
            readingTimeMinutes: finalReadingTime,
            seo: seo || {},
            createdBy: userId
        });

        return await Article.findById(article._id)
            .populate("author", "name slug profileImage")
            .populate("category", "name slug")
            .populate("tags", "name slug")
            .populate("featuredImage", "publicUrl altText");
    }

    async updateArticle(id, data, userId) {
        const updates = { ...data };

        if (updates.slug) {
            updates.slug = slugify(updates.slug);
            const duplicate = await Article.findOne({ slug: updates.slug, _id: { $ne: id } });
            if (duplicate) {
                throw new ApiError(409, `Article with slug '${updates.slug}' already exists`);
            }
        }

        if (updates.content && !updates.readingTimeMinutes) {
            updates.readingTimeMinutes = calculateReadingTime(updates.content);
        }

        if (userId) {
            updates.updatedBy = userId;
        }

        if (updates.status === "PUBLISHED") {
            const current = await Article.findById(id).select("publishedAt");
            if (current && !current.publishedAt && !updates.publishedAt) {
                updates.publishedAt = new Date();
            }
        }

        const article = await Article.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        })
            .populate("author", "name slug profileImage")
            .populate("category", "name slug")
            .populate("tags", "name slug")
            .populate("featuredImage", "publicUrl altText");

        if (!article) {
            throw new ApiError(404, "Article not found");
        }

        return article;
    }

    async updateStatus(id, status, userId) {
        const updates = { status: status.toUpperCase() };
        if (userId) updates.updatedBy = userId;

        if (updates.status === "PUBLISHED") {
            const current = await Article.findById(id).select("publishedAt");
            if (current && !current.publishedAt) {
                updates.publishedAt = new Date();
            }
        }

        const article = await Article.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        })
            .populate("author", "name slug")
            .populate("category", "name slug");

        if (!article) {
            throw new ApiError(404, "Article not found");
        }

        return article;
    }

    async deleteArticle(id) {
        const article = await Article.findByIdAndDelete(id);
        if (!article) {
            throw new ApiError(404, "Article not found");
        }

        await Comment.deleteMany({ article: id });
        return true;
    }
}

export default new ArticleService();
