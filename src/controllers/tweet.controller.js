import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content.length === 0) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.create({ content, owner: req.user._id });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const tweets = await Tweet.find({ owner: userId }).populate({
    path: "owner",
    select: "-password -refreshToken -__v",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  console.log(content, tweetId, "habibi");

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweet id");
  }

  if (!content) {
    throw new ApiError(400, "content is required");
  }

  const updatedTweets = await Tweet.findByIdAndUpdate(
    tweetId,
    { content: content },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweets, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweet id");
  }

  const deleteTweet = await Tweet.deleteOne({ _id: tweetId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
