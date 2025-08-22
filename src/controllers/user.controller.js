import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId); // FIXED
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
};


const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if ([fullname, email, username, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "Please fill all fields");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload an avatar");
    }

    const avatar = await uploadCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    let coverImageUrl = "";
    if (coverImageLocalPath) {
        const coverImageUpload = await uploadCloudinary(coverImageLocalPath);
        coverImageUrl = coverImageUpload?.url || "";
    }

    const user = await User.create({
        fullname,
        email,
        avatar: avatar.url,
        coverImage: coverImageUrl,
        username: username.toLowerCase(),
        password
    });

    const createdUser = await User.findById(user._id).select('-password -refreshToken');
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
);

        
});

const loginUser=asyncHandler(async(req,res)=>{
    //req body->data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {username,password,email}=req.body
    if(!username && !email ){
        throw new ApiError(400,'username or email is required')

    }
    const user = await User.findOne({
    $or: [
        username ? { username } : null,
        email ? { email } : null
    ].filter(Boolean)
});

    if(!user){
        throw new ApiError(404,'user does not exist')
    }

    const  isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,'invalid user credentials')
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).select('-password -refreshToken')
    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie('accessToken',accessToken,options)
    .cookie('refreshToken',refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            'User loggined successfully'
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

//This endpoint keeps the user logged in without asking for password again.
//Client sends refresh token when access token is expired.

// Server verifies it, checks against DB.

// If valid → new access token + new refresh token issued.

// If invalid → user is logged out
const refreshAccessToken =asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,'unauthorized request')
    }
    try{
        const decodedToken=jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
        )

        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,'invalid refresh token')
        }
        if(incomingRefreshToken !==user?.refreshToken){
            throw new ApiError(401,'refresh token is expired or used')
        }
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)

        return res
        .status(200)
        .cookie('accessToken',accessToken,options)
        .cookie('refreshToken',newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                'access token refreshed'
            )
        )
    }catch(error){
        throw new ApiError(401,error?.message ||'invalid Refresh token')
    }
    
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body

    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,'invalid old password')
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    return res
    .status(200
    .json(
        new ApiResponse(200,{},'password changed successfully')
    )
    )
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,'current user fetched successfully')
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body
    if(!fullname || !email){
        throw new ApiError(400,'all fields are required')
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email:email
            }
        },
        {new:true} //so that it returns the new one and not the old 
    ).select('-password')
    return res
    .status(200)
    .json(new ApiResponse(200,user,'account details updated successfully'))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,'avatar file is missing')
    }
    const avatar=await uploadCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,'error while uplaoding on avatar')
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select('-password')

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,'Avatar updated successfully')
    )
})

const updateCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,'coverImage file is missing')
    }

    const coverImage=await uploadCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400,'error while uploading on avatar')
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select('-password')

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,'Cover image updated successfully')
    )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, 'username is missing');
    }

    const channel = await User.aggregate([
        {
            $match: { 
                username: username?.toLowerCase() 
            }
        },
        {
            $lookup: {
                from: 'subscriptions',   // Mongo auto converts model name
                localField: '_id',
                foreignField: 'channel',
                as: 'subscribers'
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'subscribedTo'
            }
        },
        {
            $addFields: {
                subscriberCount: { $size: '$subscribers' },
                channelsSubscribedToCount: { $size: '$subscribedTo' },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [
                                req.user?._id,
                                {
                                    $map: {
                                        input: '$subscribers',
                                        as: 'sub',
                                        in: '$$sub.subscriber'
                                    }
                                }
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, 'channel does not exist');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], 'user channel fetched successfully'));
});


export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile
};
