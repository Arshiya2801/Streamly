import mongoose,{Schema} from "mongoose";
import bcrypt from 'bycrpt'
import jwt from "jsonwebtoken"
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
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String,
    },
},{
    timestamps:true
})
//before saving if we want to process something
userSchema.pre("save",function(next){
    if(!this.isModified('password')) return next();
    this.password=bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){
    await bcrypt.compare(password,this.password)
}

export const user=mongoose.model('user',userSchema)