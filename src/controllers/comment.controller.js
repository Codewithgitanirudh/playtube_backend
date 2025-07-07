import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid videoId");
  }

  // Convert page and limit to numbers
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const allComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        "owner.username": 1,
        "owner.fullName": 1,
        "owner.avatar": 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limitNumber,
    },
  ]);

  const totalComments = await Comment.countDocuments({
    video: videoId,
  });
  const totalPages = Math.ceil(totalComments / limitNumber);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          comments: allComments,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalComments,
            hasNextPage: pageNumber < totalPages,
            hasPrevPage: pageNumber > 1,
          },
        },
        "Comments fetched successfully"
      )
    );

});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid videoId");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "content is required");
  }

  // create a comment
  const comment = await Comment.create({
    video: videoId,
    owner: req.user._id,
    content: content,
  });

  if (!comment) {
    throw new ApiError(500, "Failed to create comment");
  }

  // populate the comment with the owner
  const createdComment = await Comment.findById(comment._id).populate(
    "owner",
    "username fullName avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdComment, "comment posted successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid commentId");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "content is required");
  }

  // updated comment with populate user
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content: content,
    },
    { new: true }
  ).populate("owner", "username fullName avatar");

  if (!updatedComment) {
    throw new ApiError(400, "comment not found or update failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid commentId");
  }

  // find and delete the comment
  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new ApiError(404, "comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
