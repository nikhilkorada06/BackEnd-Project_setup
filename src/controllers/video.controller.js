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

    const videoFile = req.files?.videoFile[0];
    const thumbnailFile = req.files?.thumbnail[0];

    // Upload video to Cloudinary
    const uploadedVideo = await uploadOnCloudinary(videoFile.path);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailFile.path);

    if(!uploadedVideo || !uploadedThumbnail) {  
        throw new ApiError(500, "Error uploading files to Cloudinary...💂🏻‍♀️💂🏻‍♀️💂🏻‍♀️");
    }

    // Create video document in MongoDB
    const newVideo = new Video({
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
    const { videoId } = req.params;
    //TODO: get video by id
})



const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail

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