import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video

    const { videoId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        // If like exists, remove it (unlike)
        await Like.deleteOne({ _id: existingLike._id });

        return res
        .status(200)
        .json( new ApiResponse(200, null, "Your Like Removed Successfully !!!😢😢😢"));
    }

    const like = await Like.create({
        video: videoId,
        likedBy: userId,
    })

    return res
    .status(200)
    .json( new ApiResponse(200, like, "Your Like Counted Successfully !!!😍😍😍"));

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}