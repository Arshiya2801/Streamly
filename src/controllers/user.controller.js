import {asyncHandler} from '../utils/asynchandler.js'
import { ApiError } from '../utils/ApiError.js';
import {user, User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { app } from '../app.js';

const registerUser=asyncHandler(async(req,res)=>{
    // get user details from frontend
    // validation not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object -create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const {fullname,email,username,password}=req.body
    console.log("email:",email);
    //get the user details and validation not empty
    if(
        [fullname,email,username,password].some((feild)=>
        feild?.trim()==="")
    ){
        throw new ApiError("Please fill all fields",400);
    }
    // check if user already exists
    const existeduser=User.find({
        $or:[{username},{email}]
    })
    if(existeduser){
        throw new ApiError(409,"User with this email or username already exists")
    }

    //check for images
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const CoverImageLocalPath=req.files?.coverImage[0]?.path;


    //check for avatar
    if(!avatarLocalPath){
        throw new ApiError ("Please upload an avatar",400);
    }
     
    //upload them to cloudinary, avatar
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(CoverImageLocalPath) 

    if(!avatar){
        throw new ApiError("Avatar file is required",400);
    }
    //database entry
    const user=await User.create({ //await is majorly used when we think that the process will take time
        fullname,
        email,
        avatar:avatar.url,
        coverImage:coverImage.url,
        username:username.toLowercase(),
        password
    })
    //to remove the certain fields from the response
    const createduser=await User.findById(user._id).select(
        '-password -refreshToken'
    )

    //finally check whether the user has been created or not
    if(!createduser){
        throw new ApiError(500,'Something went wrong while registering the user ')
    }

    //return response
    
})

export {registerUser}