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



const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists

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



const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    //TODO: add video to playlist
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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