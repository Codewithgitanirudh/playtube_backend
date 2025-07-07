import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid videoId");
  }

  const likedVideo = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (!likedVideo) {
    // Create new like
    const video = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video liked successfully"));
  } else {
    // Remove existing like
    await Like.findByIdAndDelete(likedVideo._id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video unliked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid commentId");
  }

  const likedComment = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (!likedComment) {
    // Create new like
    const comment = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, comment, "comment liked successfully"));
  } else {
    // Remove existing like
    await Like.findByIdAndDelete(likedComment._id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "comment unliked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweetId");
  }

  const likedTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (!likedTweet) {
    // Create new like
    const tweet = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "tweet liked successfully"));
  } else {
    // Remove existing like
    await Like.findByIdAndDelete(likedTweet._id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "tweet unliked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    
  const getLikedVideo = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true },
  }).populate("video", "videoFile thumbnail description title duration views");

  if (!getLikedVideo) {
    throw new ApiError(400, "video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, getLikedVideo, "all videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
