import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"



const createPlaylist = asyncHandler(async (req, res) => {
    // // TODO: create playlist

    const { name, description } = req.body;
    const userId = req.userId;
    const videos = [];
    
    if ( !isValidObjectId( userId ) ) {
        throw new ApiError( 400, "Invalid User ID" );
    }

    if ( !name || !description ) {
        throw new ApiError( 400, "Name and description are required...🤏🤏🤏" );
    }

    const playlist = await Playlist.create( {
        name,
        description,
        videos,
        owner: userId,
    } );

    if( !playlist ){
        throw new ApiError( 404, "Your Request for a New PLAYLIST Failed...😔😔😔" );
    }

    return res
    .status( 200 )
    .json ( new ApiResponse( 200, playlist, "New PLAYLIST Created Successfully !!!😍😍😍") );

})



const getUserPlaylists = asyncHandler( async (req, res) => {
    // // TODO: get user playlists

    const { userId } = req.params;

    if ( !isValidObjectId( userId ) ) {
        throw new ApiError( 400, "Invalid User ID" );
    }

    const playlists = await Playlist.find( { owner: userId } ).populate( "videos" );

    if( !playlists ){
        throw new ApiError( 404, "No PLAYLISTS Found for this User...😔😔😔" );
    }

    if( playlists.length === 0 ){
        return res
        .status( 200 )
        .json ( new ApiResponse( 200, playlists, "No PLAYLISTS Available for this User...🤷‍♂️🤷‍♂️🤷‍♂️") );
    }

    return res
    .status( 200 )
    .json ( new ApiResponse( 200, playlists, "User PLAYLISTS Retrieved Successfully !!!😍😍😍") );

})



const getPlaylistById = asyncHandler( async (req, res) => {
    // // TODO: get playlist by id

    const { playlistId } = req.params

    if( !isValidObjectId(playlistId) ){
        throw new ApiError( 404, "Invalid Playlist ID...😔😔😔" );
    }

    const playlist = await Playlist.findById( playlistId );

    if( !playlist ){
        throw new ApiError ( 404, "Error finding playlist...😔😔😔" );
    }

    return res
    .status( 200 )
    .json( new ApiResponse(
        201, 
        playlist, 
        "PlayList Retrieved Successfully!!!💂🏻‍♀️💂🏻‍♀️💂🏻‍♀️"
    ) );

})



const addVideoToPlaylist = asyncHandler( async (req, res) => {
    // // TODO: add video to playlist

    const { playlistId, videoId } = req.params;

    if( !isValidObjectId( playlistId ) || !isValidObjectId( videoId ) ){
        throw new ApiError ( 404, "playlistId or videoId is invalid...😔😔😔" );
    }

    const playlist = await Playlist.findByIdAndUpdate( 
        playlistId,
        {
            $addToSet: { videos: videoId },
        },
        {
            new: true,
        }
    )
    
    if( !playlist ){
        throw new ApiError ( 404, "PlayList NOT FOUND...😔😔😔" );
    }

    return res
    .status( 200 )
    .json( new ApiResponse( 
        200, 
        playlist, 
        "Video Added To Playlist Successfully!!!🍹🍹🍹"
    ) );

} )




const removeVideoFromPlaylist = asyncHandler( async (req, res) => {
    // // TODO: remove video from playlist

    const { playlistId, videoId } = req.params;

    if( !isValidObjectId( playlistId ) || !isValidObjectId( videoId ) ){
        throw new ApiError ( 404, "playlistId or videoId is invalid...😔😔😔" );
    }

    const playlist = await Playlist.findByIdAndUpdate( 
        playlistId,
        {
            $pull: { videos: videoId },
        },
        {
            new: true,
        }
    )

    if( !playlist ){
        throw new ApiError ( 404, "PlayList NOT FOUND...😔😔😔" );
    }

    return res
    .status( 200 )
    .json( new ApiResponse( 
        200, 
        playlist, 
        "Video Removed From Playlist Successfully!!!🍹🍹🍹"
    ) );

})



const deletePlaylist = asyncHandler( async (req, res) => {
    // // TODO: delete playlist

    const { playlistId } = req.params;

    if( !isValidObjectId( playlistId ) ){
        throw new ApiError ( 404, "playlistId is invalid...😔😔😔" );
    }

    const playlist = await Playlist.findByIdAndDelete( playlistId );

    if( !playlist ){
        throw new ApiError ( 404, "PlayList NOT FOUND...😔😔😔" );
    }

    return res
    .status( 200 )
    .json( new ApiResponse( 
        200, 
        null, 
        "Playlist Deleted Successfully!!!🍹🍹🍹"
    ) );
})



const updatePlaylist = asyncHandler( async (req, res) => {
    // // TODO: update playlist

    const { playlistId } = req.params;
    const { name, description } = req.body;

    if( !isValidObjectId( playlistId ) ){
        throw new ApiError ( 404, "playlistId is invalid...😔😔😔" );
    }

    if( !name || !description ){
        throw new ApiError ( 400, "Name or Description is missing...🤏🤏🤏" );
    }

    const playlist = await Playlist.findByIdAndUpdate( 
        playlistId,
        {
            $set: {
                name,
                description,
            },
        },
        {
            new: true,
        }
    )

    if( !playlist ){
        throw new ApiError ( 404, "PlayList NOT FOUND...😔😔😔");
    }

    return res
    .status( 200 )
    .json( new ApiResponse( 
        200, 
        playlist, 
        "Playlist Updated Successfully!!!🍹🍹🍹"
    ) );

})



export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}