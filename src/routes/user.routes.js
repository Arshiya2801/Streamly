import { Router } from "express";
import {loginUser, logoutUser, registerUser,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory} from '../controllers/user.controller.js';
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const userRouter=Router()

userRouter.route('/register').post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
    ) // now in this hwn we write /users then it would be added in front of it ie /users/register

userRouter.route('/login').post(loginUser)

userRouter.route('/logout').post(verifyJWT,logoutUser)
userRouter.route('/refresh-token').post(refreshAccessToken)
userRouter.route('/change-password').post(verifyJWT,changeCurrentPassword)
userRouter.route('/current-user').get(verifyJWT,getCurrentUser)
userRouter.route('/update-account').patch(verifyJWT,updateAccountDetails)
userRouter.route('/avatar').patch(verifyJWT,upload.single('avatar'),updateUserAvatar) // verify, multer, controller
userRouter.route('/cover-image').patch(verifyJWT,upload.single('coverImage'),updateCoverImage)
userRouter.route('/c/:username').get(verifyJWT,getUserChannelProfile)
userRouter.route('/history').get(verifyJWT,getWatchHistory)

export {userRouter};
