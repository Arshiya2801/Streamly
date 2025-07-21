import cookieParser from "cookie-parser"
import express from "express"
const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"})) // to support JSON-encoded bodies
app.use(express.urlencoded({extended:true,limit:"16kb"})) // to support URL-encoded bodies
app.use(express.static("public")) // to serve static files from the "public" directory
app.use(cookieParser()) // to parse cookies
export {app}