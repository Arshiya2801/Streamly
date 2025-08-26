import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = new Playlist({
        name,
        description,
        owner:req.user._id
    })

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user ID")
    }
    const playlists=await Playlist.find({owner:userId}).populate('videos')

    return res.status(200).json(200,playlists,'User playlists fetched successfully')
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlists= await Playlist.findById(playlistId).populate('videos')

    return res.status(200).json(new ApiResponse(200,playlists,'Playlist fetched successfully')) 
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist ID or video ID")
    }

    const playlist= await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }
    if(playlist.videos.include(videoId)){
        throw new ApiError(400, "Video already in playlist")
    }   
    playlist.videos.push(videoId)
    await playlist.save()
    return res.status(200).json(new ApiResponse(200,playlist,"Video added to playlist successfully"))
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist ID or video ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }
    playlist.videos=playlist.videos.filter(
        (vid)=> vid.toString() !== videoId.toString()
    )

    await playlist.save()
    return res.status(200).json(new ApiResponse(200,playlist,"Video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist= await Playlist.findByIdAndDelete(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist =await Playlist.findByIdAndUpdate(
        playlistId,
        {name, description},
        {new:true}
    )
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }
    return res.status(200).json(new ApiResponse(201,playlist,"Playlist updated successfully"))
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