import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"




const toggleSubscription = asyncHandler( async (req, res) => {
    // // TODO: controller to toggle subscription

    const { channelId } = req.params
    const subscriberId = req.user._id;

    if ( !isValidObjectId(channelId) ) {
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
    // // TODO: controller to return subscriber list of a channel

    const { cursor, limit = 3 } = req.query;
    const { channelId } = req.params;
    
    if( !isValidObjectId( channelId ) ){
        throw new ApiError(400, "Invalid CHANNEL ID...💔💔💔")
    }

    let query = {
        channel: channelId,
    };

    if( cursor ){
        query._id = { 
            $gt: cursor 
        }
    }

    const subscribers = await Subscription.find( query )
    .sort( { _id: 1 } )
    .limit( parseInt( limit ) )
    .populate( 'subscriber', 'username avatar subscribersCount' );

    if( !subscribers ){
        throw new ApiError(404, "No Subscribers Found for this Channel...😔😔😔");
    }

    if( subscribers.length === 0 ){
        return res
        .status(200)
        .json( new ApiResponse(200, [], "No More Subscribers Left for this Channel...😔😔😔"));
    }

    return res
    .status(200)
    .json( new ApiResponse(200, subscribers, "Channel Subscribers fetched Successfully!!!😍😍😍"));

})




const getSubscribedChannels = asyncHandler( async (req, res) => {
    // // TODO: controller to return channel list to which user has subscribed

    const { cursor, limit=3 } = req.query;
    const { subscriberId } = req.params;

    if( !isValidObjectId( subscriberId ) ){
        throw new ApiError (404, "Subscriber ID is InValid !!!🥺🥺🥺");
    }

    let query = {
        subscriber: subscriberId,
    };

    if( cursor ){
        query._id =  {
            $lt: cursor,
        };
    }

    const channels = await Subscription.find( query )
    .sort( {_id: -1} )
    .limit( parseInt( limit ) )
    .populate("channel", "username avatar")

    if( !channels ){
        new ApiError ( 404, "Sorry! Error Finding Channels...😔😔😔" );
    }

    if( channels.length === 0 ){
        return res
        .status(200)
        .json( new ApiResponse ( 200, [], "No More Subscribed Channels Left...😔😔😔" ) );
    }

    return res
    .status(200)
    .json( new ApiResponse ( 200, channels, "Subscribed Channels Fetched Successfully!!!😍😍😍" ) );
})




export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}