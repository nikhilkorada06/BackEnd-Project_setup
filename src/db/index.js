import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
            console.log(`\nMongoDB connected!! DB             : ${connectionInstance} \n`);
            console.log(` MongoDB connected!! DB Connection   : ${connectionInstance.connection} \n`);
            console.log(` MongoDB connected!! DB Host         : ${connectionInstance.connection.host} \n`);
            console.log(` MongoDB connected!! DB Name         : ${connectionInstance.connection.name} \n`);
            console.log(` MongoDB connected!! DB Ready State  : ${connectionInstance.connection.readyState} \n`);
    } catch (error) {
        console.log("MONGO_DB Connection error : ", error);
        process.exit(1);
    }
}

export default connectDB;