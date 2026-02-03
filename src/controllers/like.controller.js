import mongoose, { isValidObjectId } from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"



const toggleVideoLike = asyncHandler(async (req, res) => {
    // // TODO: toggle like on video

    const { videoId } = req.params;
    const userId = req.user._id;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid VIDEO ID...💔💔💔")
    }

    const existingLike = await Like.findOne(
        { 
            video: videoId, 
            likedBy: userId 
        }
    );

    if (existingLike) {
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
    // // TODO: toggle like on comment

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
    // // TODO: get all liked videos

    
    //----------Normal Method (Without Pagination)----------

    // const userId = req.user._id;

    // const likedVideos = await Like.find(
    //     { 
    //         likedBy: userId, 
    //         video: { 
    //             $exists: true 
    //         } 
    //     }
    // ).populate('video');    // Populate video details --> shows the complete video object instead of just the ID

    

    
    //----------Cursor Pagination Method ----------
    
    const userId = req.user._id;
    const { cursor, limit = 3 } = req.query;
    
    let query = {
        likedBy: userId,
        video: {
            $exists: true,
        }
    }
    
    if( cursor ){
        query._id = { 
            $lt: cursor 
        }
    }
    
    const likedVideos = await Like
    .find( query )
    .limit( parseInt( limit ) )
    .sort( { _id: -1 } )
    .populate( 'video' );    // Populate video details --> shows the complete video object instead of just the ID
    
    if( !likedVideos ){
        throw new ApiError(404, "No Liked Videos Found !!!😔😔😔");
    }

    if( likedVideos.length === 0 ){
        return res
        .status( 200 ) 
        .json( new ApiResponse( 200, [], "No Liked Videos Found !!!😔😔😔" ) );
    }

    return res
    .status( 200 )
    .json( new ApiResponse( 200, likedVideos, "Liked Videos Fetched Successfully !!!😍😍😍" ) );

})



export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}