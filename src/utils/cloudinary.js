import {vs as cloudinary} from 'cloudinary' 
import fs from 'fs'

cloudinary.config({
    cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:  process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCludinary=async (localFilePath)=>{
    try{
        if(!localFilePath) return null
        // upload the file on cloudinary
        const respnse=await cloudinary.uploader.upload
        (localFilePath,{
            resource_type:"auto"
        })
        console.log("file is uploaded on cloudinary")
    }catch(error){
        fs.unlinkSync(localFilePath)
        return null;
    }
}

cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
{ public_id: "olympic_flag" },
function (error, result) { console.log(result); });

export {app}
