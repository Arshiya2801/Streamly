import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId=req.user._id
    if(!channelId){
        throw new ApiError(400,"Channel ID is required")
    }
    const totalVideos=await Video.countDocuments({owner:channelId})

    const viewsAgg= await Video.aggregate([
        {
            $match:{
                owner:new mongoose.types.objectId(channelId)
            }
        },
        {
            $group:{
                _id:null,
                totalViews:{$sum:"$views"}
            }
        }
    ])

    const totalViews= viewsAgg.length>0 ? viewsAgg[0].length: 0

    const likeCount= await Like.countDocuments({owner:channelId,like:true})({owner:channelId,like:true})
    const subscriberCount= await Subscription.countDocuments({channel:channelId})

    return res
    .status(200)
    .json(
        new ApiResponse(200,{
            totalVideos,
            totalViews,
            likeCount,
            subscriberCount
        },"Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId= req.user._id
    if(!channelId){
        throw new ApiError(400,"Channel ID is required")
    }
    const videos =await Video.find({owner:channelId}) 
        .sort({createdAt:-1})
        .select("title description views createdAt thumbnail");

    return res.status(200).json(
        new ApiResponse(201,videos,"Channel videos fetched successfully")) 
})

export {
    getChannelStats, 
    getChannelVideos
    }