// in this approach we gonna place different function in different folders and we gonna import them....
// require('dotenv').config({path: '../.env'})

import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config(
    {
        path: '../.env'
    }
);

connectDB()
.then(() => {
    //replaced mount with error
    app.on("mount", (error)=> {
        console.log("ERROR : ", error);
        throw error;
    })

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server Is Running at Port : ${PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection failed...", err);
    throw err;
})




//In this approach everything is defined here itself...

/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";

const app = express();

;( async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        app.on("error", (error) => {
            console.log("Error : ", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`App is Listening on the Port ${process.env.PORT}`)
        })

    } catch (error) {
        console.log("Error: ",error);
        throw error;
    }
}) ()

*/