import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiErrors.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../models/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {      // received id of the user as an argument
    try {
        const user = await User.findById(userId);           //find the user using his id.
        const accessToken  = user.generateAccessToken();    //generate access token
        const refreshToken = user.generateRefreshToken();   //generate refersh token
        user.refreshToken = refreshToken;                   //save refresh token in database.
        await user.save({ validateBeforeSave: false });     //save as it is without any validation 
                                                            //if this line is not given then we need to use password to modify the db.
        return {accessToken, refreshToken};
    } catch (error) {
        console.error("Error Generating tokens:", error);
        throw new ApiError(500, "Something Went Wrong While Generating REFRESH and ACCESS TOKENS"); //Incase of any error in generating both the tokens show this error.
    }
};

const registerUser = asyncHandler( async (req, res)=> {
    console.log("Register controller hit, Hii From user.controller.js");
    console.log(" request reached ");

    // res.status(200).json({
    //     message: "User Registered Successfully"
    // })


    //--------------steps to follow to register a user-----------------
    //step 1 -- get data from frontend
    //step 2 -- Validation -- any field empty 
    //step 3 -- check if user already exists or not -- check with either email or username
    //step 4 -- check for images or check for avatar 
    //step 5 -- upload them to cloudnary
    //step 6 -- create a user object -- create entry in db 
    //step 7 -- when we enter something into our mongo DB it will 
    //          give a response containing all the data we entered.
    //          so we need to remove password and refresh token field from response
    //step 8 -- check for user creation if user created successfully give a
    //           response if not show that error message.
    //step 9 -- return response...



    
    //step 1 :- get data from frontend
    const {fullName, email, username, password} = req.body;

    console.log("email: ", email , 
                " username: ", username, 
                " fullName: ", fullName,   
                " password: ", password,  
                " req.files: ", req.files
    );

    
    //step 2 :- validation

    // if(fullName == ''){
    //     throw new ApiError(400, "FullName is Required...")
    // }
    // we can do this checking "some" propertry in JS

    if([fullName, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All Fields are Required...")
    }
    

    //step 3 :- Check if user already exists or not
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already Exists...");
    }
    console.log(req.files);


    //step 4 :- check for images or check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath =  req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar Image is Required...");
    }


    //step 5 :- Upload it to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    //conforming the upload of avatar and coverImage to cloudianry
    if(!avatar){
        throw new ApiError(400, "Avatar or coverImage upload Failed...");
    }


    //step 6 :- create a user object -- create entry in db
    const user = await User.create(
        {
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        }
    )


    //step 7 :- Remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "
    );


    //step 8 :- check weather user successfully created or not
    if(!createdUser){
        throw new ApiError(500, "SomeThing went wrong while registering the user...")
    }


    //step 8 :- return response...
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully...")
    )
    
});

const loginUser = asyncHandler( async (req, res)=> {
    //receive request body -> data
    //user can login using either username or email
    //find the user
    //if user found check password.
    //generate both access and refersh tokens
    //send both tokens as cookies

    const { email, username, password } = req.body;
    if ( !(username || email) ) {
        throw new ApiError(400, "UserName or E-Mail is Mandatory...");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(!user){
        throw new ApiError(404, "User Doesn't EXIST !!!");
    }
    const isPasswordVaild = await user.isPasswordCorrect(password);
    if(!isPasswordVaild){
        throw new ApiError( 401, "Invlaid Password !!!..")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");  //in user object we have a lot of unwanted keys like we have no use with password and refresh token
                                                                                            //actually we dont need password filed and refershToken filed is also empty 
                                                                                            // as we are filling it after finding the user. so this refreshToken value would be empty
                                                        // generating cookies...
    const options = {                                   //objects that sets the specifications of our cookies...
        httpOnly: true,
        secure : true,
    }                                                   //By default created cookies are accessible of everyone but by setting "httpOnly" and "secure" to true. Cookies would be only accessible to SERVER only...

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Succesfully..."
        )
    );


});

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {                                     // "$set" operator is used to update the value of a field in a document.
                refreshToken: undefined,
            }
        },
        {
            new: true,                                  /*By adding this we will get updated user object in response if we set 
                                                        new to false we will get old user object in response and it contains refershToken.*/
        }
    )

    const options = {                                   //objects that sets the specifications of our cookies...
        httpOnly: true,
        secure : true,
    }                                                   //By default created cookies are accessible of everyone but by setting "httpOnly" and "secure" to true. Cookies would be only accessible to SERVER only...
    
    return res
    .status(200)
    .clearCookie("accessToken", options)                //clearing cookies on logout
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,                                        //status code
            {},                                         //no data to send on logout
            "User Logged Out Succesfully..."            //message after logout
        )
    );
})

const refreshAccessToken = asyncHandler( async (req, res) => {
    
    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken;
    
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request !!!");
    }
    
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        
        const user = await User.findById(decodedToken?._id);
        
        if(!user){
            throw new ApiError(401, "Invalid Refersh Token !!!");
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is Expired !!!");
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token Refreshed Successfully !!! 🥳🥳🥳"
            )
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token 😔😔😔")
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};