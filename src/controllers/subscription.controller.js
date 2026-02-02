import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"



// controller to toggle subscription

const toggleSubscription = asyncHandler( async (req, res) => {
    // // TODO: toggle subscription

    const { channelId } = req.params
    const subscriberId = req.user._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const existingSubscription = await Subscription.findOne( 
        {
            channel: channelId,
            subscriber: subscriberId,
        }
    );

    if( existingSubscription ){
        await Subscription.deleteOne( { _id: existingSubscription._id } );

        return res
        .status(200)
        .json( new ApiResponse( 200, existingSubscription, "You UNSUBSCRIBED Successfully...💂🏻‍♀️💂🏻‍♀️💂🏻‍♀️" ) );
    }

    const subscription = await Subscription.create( 
        {
            subscriber: subscriberId,
            channel: channelId,
        } 
    )

    if(!subscription){
        throw new ApiError(400, "Your Request for SUBSCRIBE Failed,...😔😔😔");
    }

    return res
    .status(200)
    .json( new ApiResponse( 200, subscription, "You SUBSCRIBED Successfully!!!😍😍😍" ) );

})




const getUserChannelSubscribers = asyncHandler( async (req, res) => {
    // TODO: controller to return subscriber list of a channel

    const { cursor, limit = 10 } = req.query;

    const { channelId } = req.params;

    if(!isValidObjectId( channelId )){
        throw new ApiError(400, "Invalid CHANNEL ID...💔💔💔")
    }

    const subscribers = await Subscription.find( 
        {
            channel: channelId,
        } 
    )
    .limit(parseInt(limit))
    .skip(cursor ? parseInt(cursor) : 0)
    .populate("subscriber", "name email avatar");

    return res
    .status(200)
    .json( new ApiResponse(200, subscribers, "Channel Subscribers fetched Successfully!!!😍😍😍"));

})




const getSubscribedChannels = asyncHandler( async (req, res) => {
    //TODO: controller to return channel list to which user has subscribed
    const { subscriberId } = req.params
})



export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}