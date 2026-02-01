import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"



const toggleVideoLike = asyncHandler(async (req, res) => {
    // // TODO: toggle like on video

    const { videoId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        // If like exists, remove it (unlike)
        await Like.deleteOne({ _id: existingLike._id });

        return res
        .status(200)
        .json( new ApiResponse(200, null, "Your Like on Video Removed Successfully !!!😢😢😢"));
    }

    const like = await Like.create({
        video: videoId,
        likedBy: userId,
    })

    if(!like){
        throw new ApiError(500, "Unable to process your LIKE at the moment. Please try again later.");
    }

    return res
    .status(200)
    .json( new ApiResponse(200, like, "Your Like Counted Successfully on Video!!!😍😍😍"));

})



const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment

    const {commentId} = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if(existingLike){
        await Like.deleteOne({_id: existingLike._id});

        return res
        .status(200)
        .json( new ApiResponse(200, null, "Your Like on Comment Removed Successfully !!!😢😢😢"));
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: userId,
    })

    if(!like){
        throw new ApiError(500, "Unable to process your LIKE at the moment. Please try again later.");
    }

    return res
    .status(200)
    .json( new ApiResponse(200, like, "Your Like Counted Successfully on Comment!!!😍😍😍"));
})



const toggleTweetLike = asyncHandler(async (req, res) => {
    // // TODO: toggle like on tweet

    const {tweetId} = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if(existingLike){
        await Like.deleteOne({_id: existingLike._id});

        return res
        .status(200)
        .json( new ApiResponse(200, null, "Your Like on Tweet Removed Successfully !!!😢😢😢"));
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: userId,
    })

    if(!like){
        throw new ApiError(500, "Unable to process your LIKE at the moment. Please try again later.");
    }

    return res
    .status(200)
    .json( new ApiResponse(200, like, "Your Like Counted Successfully on Tweet!!!😍😍😍"));

})



const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})



export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}