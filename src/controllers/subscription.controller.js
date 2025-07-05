import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function validateChannelId(channelId){
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }
}

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  // user cannot subscribe to their own channel
  if (channelId.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  // validate channel id
  validateChannelId(channelId);

  // check if user is already subscribed to the channel
  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  // if user is already subscribed to the channel, unsubscribe
  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res.status(200).json(new ApiResponse(200, null, "unsubscribed"));
  }

  // if user is not subscribed to the channel, subscribe
  const newSubscription = await Subscription.create({
    channel: channelId,
    subscriber: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newSubscription, "subscribed"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;  
  
  // validate channel id
  validateChannelId(channelId);

  // get subscribers of the channel
  const subscribers = await Subscription.find({ channel: channelId })
    .populate({
      path: "subscriber",
      select: "-password -refreshToken -__v"
    });

  // if no subscribers found, throw error
  if (!subscribers) {
    throw new ApiError(404, "No subscribers found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // validate subscriber id
  validateChannelId(subscriberId);

  // get channels to which user has subscribed
  const subcribedChannels = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel");

  // if no subscribed channels found, throw error
  if (!subcribedChannels) {
    throw new ApiError(404, "No subscribed channels found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subcribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
