import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createTweet = asyncHandler( async (req, res) => {
    // // TODO: create tweet
    const tweetContent = req.body.content;
    const userId = req.user._id;

    if (!tweetContent || tweetContent.trim() === "") {
        throw new ApiError(400, "Tweet content cannot be empty");
    }

    const newTweet = await Tweet.create({
        content: tweetContent,
        owner: userId,
    });

    return res
    .status(201)
    .json(new ApiResponse(201, newTweet, "Tweet created successfully !!!😍😍😍"));
})



const getUserTweets = asyncHandler( async (req, res) => {
    // // TODO: get user tweets

    const { userId } = req.params || req.user._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const tweets = await Tweet.find({ owner: userId }).populate('owner', 'username avatar').sort({ createdAt: -1 });

    return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully !!!😍😍😍"));

})



const updateTweet = asyncHandler( async (req, res) => {
    // // TODO: update tweet

    const { content } = req.body;

    if(!content){
        throw new ApiError (400, "Tweet Content is EMPTY...😥😥😥");
    }

    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            },
        },
        {
            new: true,
        }
    )

    return res
    .status(200)
    .json( new ApiResponse (200, tweet, "Tweet Updated Successfully !!!...🍹🍹🍹") );

})



const deleteTweet = asyncHandler( async (req, res) => {
    // // TODO: delete tweet

    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
    .status(200)
    .json( new ApiResponse (200, null, "Tweet Deleted Successfully !!!...🍹🍹🍹") );

})



export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}