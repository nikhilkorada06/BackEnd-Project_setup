import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"





const getChannelStats = asyncHandler( async (req, res) => {
    // // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    let { channelId } = req.params;

    if ( !isValidObjectId( channelId ) ) {
        throw new ApiError( 400, "Invalid Channel ID" );
    }

    let channelStats = {};


    //Total Videos...
    const totalVideos = await Video.find( { owner: channelId } );
    channelStats.totalVideos = totalVideos.length; 


    //Total Subscribers...
    const totalSubscribers = await Subscription.find( { channel: channelId } );
    channelStats.totalSubscribers = totalSubscribers.length;


    //Total Likes...
    const totalLikes = await Like.aggregate( 
        [
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "videoDetails"
                }
            },
            {
                $unwind: "$videoDetails"       // Deconstructs the array field to get object
            },
            {
                $match: {
                    "videoDetails.owner": new mongoose.Types.ObjectId( channelId )
                }
            },
            {
                $count: "likeCount",
            }
        ]
     )
    channelStats.totalLikes = totalLikes.length > 0 ? totalLikes[0].likeCount : 0;


    //Total Views...
    const totalViews = await Video.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId( channelId )
                }
            },
            {
                $group: {
                    _id: null,              // Grouping all documents no separate groups
                    viewsCount: { 
                        $sum: "$views",     // Summing up the views field of all the matched documents
                    }
                }
            }
        ]
    )
    channelStats.totalViews = totalViews.length > 0 ? totalViews[0].viewsCount : 0;


    return res
    .status( 200 )
    .json( new ApiResponse(
        200,
        channelStats,
        "Channel stats fetched successfully...!!!🎉🎉🎉"
    ) );
})





const getChannelVideos = asyncHandler( async (req, res) => {
    // //  TODO: Get all the videos uploaded by the channel

    let { channelId } = req.params;

    if ( !isValidObjectId( channelId ) ) {
        throw new ApiError( 400, "Invalid Channel ID" );
    }

    const videos = await Video.find( { owner: channelId } );

    if(!videos){
        throw new ApiError( 404, "Videos Fetching Failed...😔😔😔");
    }

    return res
    .status( 200 )
    .json( new ApiResponse( 
        200, 
        videos, 
        "Videos FETCHED Successfully!!!🍹🍹🍹"
    ) );

})



export {
    getChannelStats, 
    getChannelVideos
} 