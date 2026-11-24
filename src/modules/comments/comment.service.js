import Comment from "./comments.model.js";
import Article from "../articles/article.model.js";
import ApiError from "../../utils/ApiError.js";
import { parsePagination, buildPaginationMeta, isValidObjectId } from "../../utils/helpers.js";

class CommentService {
    async getAllComments(query) {
        const { page, limit, skip } = parsePagination(query);
        const filter = {};

        if (query.article) {
            if (!isValidObjectId(query.article)) {
                throw new ApiError(400, "Invalid article ID");
            }
            filter.article = query.article;
        }

        if (query.status) {
            filter.status = query.status.toUpperCase();
        } else if (!query.all) {
            filter.status = "APPROVED";
        }

        if (query.parentComment !== undefined) {
            filter.parentComment = query.parentComment === "null" ? null : query.parentComment;
        }

        const [comments, total] = await Promise.all([
            Comment.find(filter)
                .populate("user", "name email role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Comment.countDocuments(filter)
        ]);

        const meta = buildPaginationMeta(total, page, limit);
        return { comments, meta };
    }

    async getCommentById(id) {
        const comment = await Comment.findById(id)
            .populate("user", "name email")
            .populate("article", "title slug")
            .populate("parentComment")
            .lean();

        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        const replies = await Comment.find({ parentComment: id, status: "APPROVED" })
            .populate("user", "name email")
            .sort({ createdAt: 1 })
            .lean();

        return { ...comment, replies };
    }

    async createComment(data, authenticatedUser) {
        const { article, guestName, guestEmail, body, parentComment } = data;

        const articleExists = await Article.findById(article);
        if (!articleExists) {
            throw new ApiError(404, "Article not found");
        }

        if (parentComment) {
            const parent = await Comment.findById(parentComment);
            if (!parent) {
                throw new ApiError(404, "Parent comment not found");
            }
        }

        return await Comment.create({
            article,
            user: authenticatedUser ? authenticatedUser._id : null,
            guestName: authenticatedUser ? "" : guestName.trim(),
            guestEmail: authenticatedUser ? "" : (guestEmail || "").trim().toLowerCase(),
            body: body.trim(),
            parentComment: parentComment || null,
            status: "PENDING"
        });
    }

    async updateBody(id, body) {
        const comment = await Comment.findByIdAndUpdate(
            id,
            { body: body.trim(), isEdited: true },
            { new: true, runValidators: true }
        );

        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        return comment;
    }

    async updateStatus(id, status) {
        const comment = await Comment.findByIdAndUpdate(
            id,
            { status: status.toUpperCase() },
            { new: true, runValidators: true }
        );

        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        return comment;
    }

    async deleteComment(id) {
        const comment = await Comment.findByIdAndDelete(id);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        await Comment.deleteMany({ parentComment: id });
        return true;
    }
}

export default new CommentService();
