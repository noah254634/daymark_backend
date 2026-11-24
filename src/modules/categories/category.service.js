import Category from "./category.model.js";
import Article from "../articles/article.model.js";
import ApiError from "../../utils/ApiError.js";
import { parsePagination, buildPaginationMeta, slugify, isValidObjectId } from "../../utils/helpers.js";

class CategoryService {
    async getAllCategories(query) {
        const { page, limit, skip } = parsePagination(query);
        const filter = {};

        if (query.isActive !== undefined) {
            filter.isActive = query.isActive === "true";
        }

        if (query.parentCategory !== undefined) {
            filter.parentCategory = query.parentCategory === "null" ? null : query.parentCategory;
        }

        if (query.search) {
            filter.name = { $regex: query.search, $options: "i" };
        }

        const [categories, total] = await Promise.all([
            Category.find(filter)
                .populate("parentCategory", "name slug")
                .populate("image", "publicUrl altText")
                .sort({ displayOrder: 1, name: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Category.countDocuments(filter)
        ]);

        const meta = buildPaginationMeta(total, page, limit);
        return { categories, meta };
    }

    async getCategoryByIdOrSlug(idOrSlug) {
        const query = isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

        const category = await Category.findOne(query)
            .populate("parentCategory", "name slug")
            .populate("image", "publicUrl altText")
            .lean();

        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        return category;
    }

    async getCategoryArticles(idOrSlug, query) {
        const category = await this.getCategoryByIdOrSlug(idOrSlug);

        const { page, limit, skip } = parsePagination(query);
        const filter = {
            category: category._id,
            status: query.status || "PUBLISHED"
        };

        const [articles, total] = await Promise.all([
            Article.find(filter)
                .populate("author", "name slug profileImage")
                .populate("featuredImage", "publicUrl altText")
                .populate("tags", "name slug")
                .sort({ publishedAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Article.countDocuments(filter)
        ]);

        const meta = buildPaginationMeta(total, page, limit);
        return { articles, meta };
    }

    async createCategory({ name, slug, description, parentCategory, image, displayOrder, isActive }) {
        const finalSlug = slug ? slugify(slug) : slugify(name);
        const existing = await Category.findOne({ slug: finalSlug });
        if (existing) {
            throw new ApiError(409, `Category with slug '${finalSlug}' already exists`);
        }

        return await Category.create({
            name: name.trim(),
            slug: finalSlug,
            description: description || "",
            parentCategory: parentCategory || null,
            image: image || null,
            displayOrder: displayOrder !== undefined ? displayOrder : 0,
            isActive: isActive !== undefined ? isActive : true
        });
    }

    async updateCategory(id, updateData) {
        const updates = { ...updateData };

        if (updates.slug) {
            updates.slug = slugify(updates.slug);
            const duplicate = await Category.findOne({ slug: updates.slug, _id: { $ne: id } });
            if (duplicate) {
                throw new ApiError(409, `Category with slug '${updates.slug}' already exists`);
            }
        }

        const category = await Category.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        })
            .populate("parentCategory", "name slug")
            .populate("image", "publicUrl altText");

        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        return category;
    }

    async deleteCategory(id) {
        const articleCount = await Article.countDocuments({ category: id });
        if (articleCount > 0) {
            throw new ApiError(400, `Cannot delete category: it is associated with ${articleCount} article(s)`);
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        return true;
    }
}

export default new CategoryService();
