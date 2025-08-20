import cookieParser from "cookie-parser" //middleware
import express from "express" //framework
import cors from 'cors'
const app=express() 

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true 
}))

app.use(express.json({limit:"16kb"})) // to support JSON-encoded bodies
app.use(express.urlencoded({extended:true,limit:"16kb"})) // to support URL-encoded bodies
app.use(express.static("public")) // to serve static files from the "public" directory
app.use(cookieParser()) // to parse cookies

//routes import
import {userRouter} from './routes/user.routes.js'

//routes declare
app.use('/api/v1/users',userRouter);

app.get("/test", (req, res) => {
  res.send("Server is working");
});

export {app};