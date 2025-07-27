import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new Schema({
    videoFile: {
            type: String, //cloudinary url
            required: true
        },
    thumbnail: {
            type: String, //cloudinary url
            required: true
        },
    title: {
            type: String, 
            required: true
        },
    description: {
            type: String, 
            required: true
        },
    duration: {
            type: Number, 
            required: true
        },
    views: {
            type: Number,
            default: 0
        },
    isPublished: {
            type: Boolean,
            default: true
        },
    owner: {
            type: Schema.Types.ObjectId, // reference to user model
            ref: "User"
        }
},{
    timestamps:true
})

videoSchema.plugin(mongooseAggregatePaginate) //pagination means splitting a large set of data into smaller chunks (pages), so you can load and view the data in parts — like browsing page 1, page 2, page 3, etc.
export const video=mongoose.model('video',videoSchema)