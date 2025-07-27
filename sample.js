/* This code snippet is setting up a file upload functionality using Node.js with Express framework.
Here's a breakdown of what it does: */
// import multer from "multer";
// import {v2 as cloudinary} from 'cloudinary';
// import fs from 'fs';

// const upload= multer({dest:'temp/'});

// app.post('/upload',upload.single(image),async(req,res)=>{
//     const local=req.file.path;
//     const result=await cloudinary.uploader.upload(local,{
//         resource_type:"auto",
//         folder:'myApp',
//     });

//     fs.unlinkSync(local);
//     res.json({url:result.secure_url});
// })