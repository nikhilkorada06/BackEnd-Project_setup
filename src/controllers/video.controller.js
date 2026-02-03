import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    // // TODO: get all videos based on query, sort, pagination

    const { page = 1, limit = 3, query, sortBy, sortType, userId } = req.query;

    const skip = (page - 1) * limit;

    let matchStage = {};

    //search filter
    if( query ){
        matchStage.$or = [
            {
                title: {
                    $regex: query,          //match pattern
                    $options: "i"           //case insensitive
                }
            },
            {
                description: {
                    $regex: query,          //match pattern
                    $options: "i"           //case insensitive
                }
            }
        ]
    }

    //owner filter
    if( userId ){
        if( !isValidObjectId( userId ) ){
            throw new ApiError( 400, "Invalid User ID" );
        }
        matchStage.owner = mongoose.Types.ObjectId( userId );
    }

    //sorting logic
    let sortStage = {};
    sortStage[ sortBy ? sortBy : "createdAt" ] = sortType === "asc" ? 1 : -1;

    const videos = await Video.aggregate(
        [
            {
                $match: matchStage,
            },
            {
                $sort: sortStage,
            },
            {
                $skip: skip,
            },
            {
                $limit: parseInt( limit ),
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails",
                },
            },
        ]
    );

    return res
    .status( 200 )
    .json( new ApiResponse( 
        200, 
        videos, 
        "Videos Fetched Successfully !!!😍😍😍"
    ) );

} );





const publishAVideo = asyncHandler(async (req, res) => {
    // // TODO: get video, upload to cloudinary, create video
    
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
    // // TODO: get video by id

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
    // // TODO: update video details like title, description, thumbnail
    
    const { videoId } = req.params;
    
    if( !videoId ){
        throw new ApiError(404, "Video not found...😔😔😔");
    }
    
    const { title, description } = req.body;

    if(!(title || description)){
        throw new ApiError( 400, "All Fields are REQUIRED...💂🏻‍♀️💂🏻‍♀️💂🏻‍♀️");
    }

    const thumbnailLocalPath = req.file?.path;

    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail File Missing or Upload Error...😔😔😔");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!thumbnail.url){
        throw new ApiError(400, "Thumbnail File Missing...😔😔😔");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url,
                title,
                description,
            }
        },
        {
            new: true,
        },
    ).select("-views")

    return res
    .status( 200 )
    .json( new ApiResponse(
        200,
        video,
        "Video Details Updated Successfully...!!!🎉🎊🎉",
    ));
})



const deleteVideo = asyncHandler(async (req, res) => {
    // // TODO: delete video
    
    const { videoId } = req.params;

    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json( new ApiResponse (200, null, "Video Deleted Successfully !!!...🍹🍹🍹"));

})



const togglePublishStatus = asyncHandler(async (req, res) => {
    // // TODO: toggle publish status of a video

    const { videoId } = req.params;

    //Get current video
    const video = await Video.findById(videoId);

    if (!video) {
        return res.status(404).json(
            new ApiResponse(404, null, "Video not found")
        );
    }

    // Toggle value
    video.isPublished = !video.isPublished;

    // Save updated doc
    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Publish Status Successfully Changed"
        )
    );

});




export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}