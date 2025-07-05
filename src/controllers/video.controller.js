import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFile = req.files?.videoFile?.[0]?.path;
  const thumbnail = req.files?.thumbnail?.[0]?.path;

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  const cloudinaryVideo = await uploadOnCloudinary(videoFile);
  const cloudinaryThumbnail = await uploadOnCloudinary(thumbnail);

  if (!cloudinaryVideo || !cloudinaryThumbnail) {
    throw new ApiError(400, "Failed to upload files to cloudinary");
  }

  const video = await Video.create({
    title,
    description,
    owner: req.user._id,
    videoFile: cloudinaryVideo.url,
    thumbnail: cloudinaryThumbnail.url,
    duration: cloudinaryVideo.duration,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "invalid videoId");
  }

  const singleVideo = await Video.findById(videoId);

  if (!singleVideo) {
    throw new ApiError(400, "video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, singleVideo, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
