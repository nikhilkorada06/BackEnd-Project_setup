import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"



const getVideoComments = asyncHandler( async (req, res) => {
    //TODO: get all comments for a video

    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;


})



const addComment = asyncHandler( async (req, res) => {
    // // TODO: add a comment to a video

    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if(!videoId || !content || !userId){
        new ApiError (400, "Error Receiving Your Comment Try Again Later !!!😔😔😔");
    }

    const comment = await Comment.create({
        content, 
        video: videoId,
        owner: userId,
    })

    if(!comment){
        new ApiError (400, "Error Uploading Your Comment Try Again Later !!!😔😔😔");
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