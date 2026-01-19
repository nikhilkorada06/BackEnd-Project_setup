// in this approach we gonna place differnt function in different folders and we gonna import them....


// require('dotenv').config({path: '../.env'})
import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import express from "express";

dotenv.config(
    {
        path: '.env'
    }
);

const app = express();

(async () => {
    try {
        await connectDB();
        
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port ${process.env.PORT || 8000}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
})();






//In this approach everthing is defined here itself...

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