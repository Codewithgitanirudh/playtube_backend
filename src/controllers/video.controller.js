import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  
  if(!isValidObjectId(userId)){
    throw new ApiError(400, "Invalid user id");
  }

  let sort = {};
  if (sortBy) {
    sort[sortBy] = sortType === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  // Build the match condition
  let matchCondition = { owner: userId };
  
  // Add search query if provided
  if (query) {
    matchCondition.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }
    ];
  }

  // Convert page and limit to numbers
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // Get videos with pagination
  const videos = await Video.find(matchCondition)
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)
    .populate("owner", "username fullName avatar");

  // Get total count for pagination info
  const totalVideos = await Video.countDocuments(matchCondition);
  const totalPages = Math.ceil(totalVideos / limitNumber);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          videos,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalVideos,
            hasNextPage: pageNumber < totalPages,
            hasPrevPage: pageNumber > 1
          }
        },
        "Videos fetched successfully"
      )
    );
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
  const { title, description } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const updateData = {};

  if (title) updateData.title = title;
  if (description) updateData.description = description;

  // Handle thumbnail upload if provided
  if (req.file) {
    const cloudinaryThumbnail = await uploadOnCloudinary(req.file.path);
    if (cloudinaryThumbnail) {
      updateData.thumbnail = cloudinaryThumbnail.url;
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(videoId, updateData, {
    new: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "invalid videoId");
  }

  await Video.deleteOne({ _id: videoId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "invalid videoId");
  }

  const videoDetail = await Video.findById(videoId);

  if (!videoDetail) {
    throw new ApiError(404, "Video not found");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { isPublished: !videoDetail.isPublished },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        "Video publish status toggled successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
