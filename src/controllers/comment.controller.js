import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    try {
        const comments = await Comment.find({ video: videoId })
            .populate("owner", "name email avatar");

        res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while fetching comments");
    }
});

const addComment = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const { text, parentCommentId } = req.body;
    if (!text) {
        throw new ApiError(400, "Comment text is required");
    }

    try {
        const newComment = new Comment({
            video: videoId,
            owner: req.user._id,
            text,
            parentComment: parentCommentId || null //for nested comments
        });

        await newComment.save();

        const populatedComment = await newComment.populate("owner", "name email avatar");

        res.status(201).json(new ApiResponse(201, populatedComment, "Comment added successfully"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while adding comment");
    }
});

const updateComment = asyncHandler(async (req, res) => {
    const commentId = req.params.commentId;
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }

    const { text } = req.body;
    if (!text) {
        throw new ApiError(400, "Comment text is required");
    }

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        if (comment.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You are not authorized to update this comment");
        }

        comment.text = text;
        await comment.save();

        res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while updating comment");
    }
});

const deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params.commentId;
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        if (comment.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You are not authorized to delete this comment");
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while deleting comment");
    }
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
