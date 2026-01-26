import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiErrors.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../models/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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

})

export {registerUser};