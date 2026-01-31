import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

 

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})



const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    
    const { title, description } = req.body;

    if(!title || !description) {
        throw new ApiError(400, "Title and Description are required...💂🏻‍♀️💂🏻‍♀️💂🏻‍♀️");
    }

    if(!req.files || !req.files.videoFile || req.files.videoFile.length === 0 || !req.files.thumbnail || req.files.thumbnail.length === 0) {
        throw new ApiError(400, "Video file and thumbnail are required...💂🏻‍♀️💂🏻‍♀️💂🏻‍♀️");
    }

    const videoFilePath = req.files?.videoFile[0]?.path;
    const thumbnailFilePath = req.files?.thumbnail[0]?.path;

    // Upload video to Cloudinary
    const uploadedVideo = await uploadOnCloudinary(videoFilePath);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailFilePath);

    if(!uploadedVideo || !uploadedThumbnail) {  
        throw new ApiError(500, "Error uploading files to Cloudinary...💂🏻‍♀️💂🏻‍♀️💂🏻‍♀️");
    }

    // Create video document in MongoDB
    const newVideo = await Video.create({
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        title,
        description,
        duration: uploadedVideo.duration,
        owner: req.user._id
    });

    return res
    .status(201)
    .json ( new ApiResponse(
            201, 
            "Video Published Successfully...!!!🎉🎉🎉",
            {
                video: newVideo
            }
        )
    );

})



const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id

    const { videoId } = req.params;

    const video = await Video.findById( videoId ).populate("owner", "username email");

    if( !video ) {
        throw new ApiError( 404, "Video not found...💂🏻‍♀️💂🏻‍♀️💂🏻‍♀️" );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video fetched successfully...!!!🎉🎉🎉",
            {
                video: video
            }
        )
    );

})



const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    
    const { videoId } = req.params;
    
    const video = await Video.findById( videoId );
    
    if(!video) {
        throw new ApiError(404, "Video not found...😔😔😔");
    }
    
    const { title, description } = req.body;

    if(title) video.title = title;
    if(description) video.description = description;

    return res
    .status(200)
    .json(
        200,
        "Video Details Updated Successfully...!!!🎉🎊🎉"
    );
})



const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
})



const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}