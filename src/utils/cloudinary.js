import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
  resource_type: 'auto',
  folder: "streamly/uploads",   // use this instead of public/temp
});


    console.log('File uploaded to Cloudinary:', response.secure_url);

    // delete temp file after upload
    fs.unlinkSync(localFilePath);
    return response;
    
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // delete even on failure
    }
    console.log("Upload Failed:", error);
    return null;
  }
};


cloudinary.uploader.upload(
    "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
    {public_id:"olymic flag"},
    function(error,result){
        if(error){
            console.error("Remote upload failed:", error);
        }
        else{
            console.log("Remote upload success:", result.secure_url);
        }
    }
)

export {uploadCloudinary};