import { Router } from "express";
import {registerUser} from '../controllers/user.controller.js';
import {upload} from "../middlewares/multer.middleware.js"

const userRouter=Router()

userRouter.route('/register').post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },
        {
            name:"CoverImage",
            maxCount:1
        }
    ]),
    registerUser) // now in this hwn we write /users then it would be added in front of it ie /users/register

export {userRouter};
