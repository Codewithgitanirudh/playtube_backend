import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  const playlistDetail = await Playlist.findById(playlist._id).populate(
    "owner",
    "username avatar coverImage fullName"
  );

  if (!playlistDetail) {
    throw new ApiError(500, "Something went wrong while creating the playlist");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, playlistDetail, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "you are not authorized to fetch playlist");
  }

  const getUserPlaylists = await Playlist.find({ owner: userId })
    .populate("videos", "title thumbnail duration views")
    .populate("owner", "username avatar fullName");

  if (!getUserPlaylists) {
    throw new ApiError(
      500,
      "something went wrong while fetching user playlists"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getUserPlaylists,
        "user playlist fetched successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId)
    .populate("videos", "title thumbnail duration views")
    .populate("owner", "username avatar fullName");

  if (!playlist) {
    throw new ApiError(500, "something went wrong while fetching playlist");
  }

  return res.status(200).json(new ApiResponse(200, playlist, "playlist fetced successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Check if the user is the owner of the playlist
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to modify this playlist");
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exists in playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { videos: videoId },
    },
    { new: true }
  )
    .populate("videos", "title thumbnail duration views")
    .populate("owner", "username avatar fullName");

  if (!updatedPlaylist) {
    throw new ApiError(
      500,
      "Something went wrong while adding video to playlist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Check if the user is the owner of the playlist
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to modify this playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  )
    .populate("videos", "title thumbnail duration views")
    .populate("owner", "username avatar fullName");

  if (!updatedPlaylist) {
    throw new ApiError(
      500,
      "Something went wrong while deleting video from playlist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added to playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this playlist");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlistId");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name: name,
      description: description,
    },
    { new: true }
  )
    .populate("videos", "title thumbnail duration views")
    .populate("owner", "username avatar fullName");

  if (!updatedPlaylist) {
    throw new ApiError(500, "something went wrong while updating list");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "updated playlist successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
