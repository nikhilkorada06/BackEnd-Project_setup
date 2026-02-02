import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"



const getVideoComments = asyncHandler( async (req, res) => {
    // // TODO: get all comments for a video

    
    //-------------------skip and limit for pagination-------------------------

    // const { videoId } = req.params;
    // const { page = 1, limit = 10 } = req.query;

    // let pageNum = parseInt(page);
    // let limitNum = parseInt(limit);
    
    // let skip = (pageNum - 1) * limitNum;

    // const comments = await Comment
    // .find( { video: videoId } )
    // .skip( skip )
    // .limit( limitNum )
    // .populate('owner', 'username avatar');

    // if(!comments || comments.length === 0){
    //     throw new ApiError (404, "NO Comments Found for this Video !!!😔😔😔");
    // }

    // return res
    // .status(200)
    // .json( new ApiResponse ( 200, comments, `${comments.length} Comments Fetched Successfully !!!😎😎😎`));


    
    
    //---------------------- cursor based pagination -------------------------

    const { videoId } = req.params;

    const { cursor, limit = 3 } = req.query;

    const query = {
        video: videoId,
    };

    if(cursor){
        query._id = { $lt: cursor };
    }

    const comments = await Comment
    .find( query )
    .sort( { _id: -1 } )
    .limit( parseInt(limit) )
    .populate('owner', 'username avatar');

    if( !comments || comments.length === 0 ){
        throw new ApiError (404, "NO Comments Found for this Video !!!😔😔😔");
    }

    return res
    .status(200)
    .json( new ApiResponse ( 
        200, 
        comments, 
        { 
            nextCursor: comments.length ? comments[comments.length -1]._id : null 
        }, 
        `${comments.length} Comments Fetched Successfully !!!😎😎😎`
    ));

})



const addComment = asyncHandler( async (req, res) => {
    // // TODO: add a comment to a video

    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if(!videoId || !content || !userId){
        throw new ApiError (400, "Error Receiving Your Comment Try Again Later !!!😔😔😔");
    }

    const comment = await Comment.create({
        content, 
        video: videoId,
        owner: userId,
    })

    if(!comment){
        throw new ApiError (400, "Error Uploading Your Comment Try Again Later !!!😔😔😔");
    }

    return res
    .status(200)
    .json( new ApiResponse ( 200, comment, "Your Comment Posted Successfully !!!😍😍😍"));
})



const updateComment = asyncHandler(async (req, res) => {
    // // TODO: update a comment

    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if( !commentId || !content || !userId ){
        throw new ApiError (400, "Error Updating Your Comment Try Again Later !!!😔😔😔");
    }

    const comment = await Comment.findByIdAndUpdate( 
        commentId,
        {
            $set: {
                content,
            }
        },
        {
            new: true,
        }
    )

    return res
    .status(200)
    .json( new ApiResponse (200, comment, "Comment Updated Successfully !!!💝💝💝"));

})



const deleteComment = asyncHandler(async (req, res) => {
    // // TODO: delete a comment

    const { commentId } = req.params;
    const userId = req.user._id;

    if( !commentId || !userId ){
        throw new ApiError( 401, "Comment DELETION Failed !!! 😔😔😔" );
    }

    await Comment.findByIdAndDelete( commentId );

    return res
    .status(200)
    .json( new ApiResponse ( 200, "Comment DELETED Successfully !!!🍹🍹🍹"));

})



export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}