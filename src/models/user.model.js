import mongoose from "mongoose";
const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, //cloudinary url
        required:true,
    },
    CoverImage:{
        type:String,
    },
    watchHistory:[{
        typr:Schema.Types.ObjectId,
        ref:"Video"
    }],
    passwaor:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String,
    },
},{
    timestamps:true
})

export const user=mongoose.model('user',userSchema)