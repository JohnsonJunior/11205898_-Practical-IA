import express from "express"
import {connectDb} from 

await connectDb("mongodb://localhost:27017"),()=> {
    console.log("db connected")
}

export const server=express()
