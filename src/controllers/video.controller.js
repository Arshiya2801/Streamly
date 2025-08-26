import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy='createdAt', sortType='desc', userId } = req.query

    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }
    const video=await Video.findById(videoId).populate('owner','name email avatar')
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );

})  

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description}=req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    if(video.owner,toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to update this video")
    }
    video.title=title|| video.title
    video.description=description|| video.description
    await video.save()
    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    if(video.owner,toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to delete this video")
    }
    await video.remove()
    return res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}