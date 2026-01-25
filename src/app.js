import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,    
    }
));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"));
app.use(cookieParser());


app.get("/", (req, res) => {
    res.status(200).json(
        {   
            message: "Welcome to ExpressJS Application"
        }
    )
});


//routes import 
import userRouter from './routes/user.routes.js'
//routes declaration
app.use("/api/v1/users", (req, res, next) => {
    console.log("User route middleware called...from app.js");
    next();
}, userRouter);

                                        //--- "/users" is also a valid route.
                                        //--- "/api/v1/users" is a common practice in production level...

export default app;