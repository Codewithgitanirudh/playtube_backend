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
  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlist not found");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid videoId");
  }

  const playlistVideoArray = await Playlist.findById(playlistId);

  if (playlistVideoArray.videos.includes(videoId)) {
    throw new ApiError(400, "video already exist");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { videos: videoId },
    },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, playlist, "video added successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
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
