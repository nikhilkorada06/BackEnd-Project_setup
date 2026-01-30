import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiErrors.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../models/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import deleteAssetFromCloudinary from "../utils/deleteAssestFromCloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {      // received id of the user as an argument
    try {
        const user = await User.findById(userId);           //find the user using his id.
        const accessToken  = user.generateAccessToken();    //generate access token
        const refreshToken = user.generateRefreshToken();   //generate refresh token
        user.refreshToken = refreshToken;                   //save refresh token in database.
        await user.save({ validateBeforeSave: false });     //save as it is without any validation 
                                                            //if this line is not given then we need to use password to modify the db.
        return {accessToken, refreshToken};
    } catch (error) {
        console.error("Error Generating tokens:", error);
        throw new ApiError(500, "Something Went Wrong While Generating REFRESH and ACCESS TOKENS"); //In case of any error in generating both the tokens show this error.
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
    //step 5 -- upload them to cloudinary
    //step 6 -- create a user object -- create entry in db 
    //step 7 -- when we enter something into our mongo DB it will 
    //          give a response containing all the data we entered.
    //          so we need to remove password and refresh token field from response
    //step 8 -- check for user creation if user created successfully give a
    //           response if not show that error message.
    //step 9 -- return response...



    
    //step 1 :- get data from frontend
    const {fullName, email, username, password} = req.body;

    console.log(" email: ", email , 
                " username: ", username, 
                " fullName: ", fullName,   
                " password: ", password,  
                " req.files: ", req.files
    );

    
    //step 2 :- validation

    // if(fullName == ''){
    //     throw new ApiError(400, "FullName is Required...")
    // }
    // we can do this checking "some" property in JS

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
    //conforming the upload of avatar and coverImage to cloudinary
    if(!avatar){
        throw new ApiError(400, "Avatar or coverImage upload Failed...");
    }


    //step 6 :- create a user object -- create entry in db
    const user = await User.create(
        {
            fullName,
            avatar: avatar.url,
            avatarPublicId: avatar.public_id,
            coverImage: coverImage?.url || "",
            coverImagePublicId: coverImage?.public_id || "",
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
    //user can 'login' using either username or email
    //find the user
    //if user found check password.
    //generate both access and refresh tokens
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
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError( 401, "Invalid Password !!!..")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");  //in user object we have a lot of unwanted keys like we have no use with password and refresh token
                                                                                            //actually we don't need password filed and refreshToken filed is also empty
                                                                                            // as we are filling it after finding the user, so this refreshToken value would be empty
   // generating cookies...

    const options = {                                   //objects that sets the specifications of our cookies...
        httpOnly: true,
        secure : true,
    }                                                   //By default, created cookies are accessible of everyone but by setting "httpOnly" and "secure" to true. Cookies would be only accessible to SERVER only...

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
            "User Logged In Successfully..."
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
                                                        new to false we will get old user object in response, and it contains refreshToken.*/
        }
    )

    const options = {                                   //objects that sets the specifications of our cookies...
        httpOnly: true,
        secure : true,
    }                                                   //By default, created cookies are accessible of everyone but by setting "httpOnly" and "secure" to true. Cookies would be only accessible to SERVER only...
    
    return res
    .status(200)
    .clearCookie("accessToken", options)                //clearing cookies on logout
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,                                        //status code
            {},                                         //no data to send on logout
            "User Logged Out Successfully..."            //message after logout
        )
    );
})

const refreshAccessToken = asyncHandler( async (req, res) => {

    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request 😔😒😔");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id);

        if(!user){
            throw new ApiError(401, "Invalid Refresh Token 😔😒😔");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is Expired 😔😒😔");
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

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid Old Password 💔💔💔")
    }
    user.password = newPassword;     
    await user.save({validateBeforeSave: false});             //password will be updated by  ' userSchema.pre("save", callback()) ' present in 'user.model.js'
                                                                // this property or hook will be called when we say "user.save" which was defined in 'user.models.js'

                                                                //I don't want to check validations so, I set validateBeforeSave to false, required validation is already done manually by that hook.
    return res
    .status(200)
    .json( new ApiResponse(200, {}, 'Password Changed Successfully 🥳🥳🥳') );
})

const getCurrentUser = asyncHandler( async (req, res) => {
    return res
    .status(200)
    .json( new ApiResponse(200, req.user, "current user Fetched Successfully !!! 🍹🍹🍹"))
})

const updateUserDetails = asyncHandler( async (req, res) => {
    const { fullName, email } = req.body;
    if (!(fullName || email)) {
        throw new ApiError(400, "All fields are Required 😊😊😊");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set: {  //set receives an object.
                fullName, 
                email,
            }
        }
    ).select("-password")          //password field is avoided from the response received

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User Details Updated... 🎉🎉🎉"))
})


const updateUserAvatar = asyncHandler( async (req, _) => {
    const avatarLocalPath = req.file?.path;                    //Take the image user given to replace previous image.

    if(!avatarLocalPath){
        throw new ApiError( 400, "Avatar File is Missing...😔😔😔");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);   //cloudinary gives response we need to use that url present in the response.

    if(!avatar.url){
        throw new ApiError(400, "Error While Uploading...🤏🤏🤏");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {                          //- $set is an update operator in MongoDB.
                avatar: avatar.url,          //- It tells MongoDB: “Update this field to the given value.”
            }                                //- If the field doesn’t exist, $set will create it     
        },
        {
            new: true,          //If you set new: true, Mongoose will instead return the updated document (the one after applying your changes).
        }
    ).select("-password");      //removes password key from the response.

    await deleteAssetFromCloudinary(user.avatar);  //deleting previous avatar from cloudinary

    return res
    .status(200)
    .json(
        new ApiResponse( 200, user, "User Avatar Updated Successfully...🎉🎉🎉")
    );

})

const updateUserCoverImage = asyncHandler( async (req, _) => {
    const coverImageLocalPath = req.file?.path;                    //Take the image user given to replace previous image.

    if(!coverImageLocalPath){
        throw new ApiError( 400, "CoverImage File is Missing...😔😔😔");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);   //cloudinary gives response we need to use that url present in the response.

    if(!coverImage.url){
        throw new ApiError(400, "Error While Uploading...🤏🤏🤏");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {                                 //- $set is an update operator in MongoDB.
                coverImage: coverImage.url,         //- It tells MongoDB: “Update this field to the given value.”
            }                                       //- If the field doesn’t exist, $set will create it     
        },
        {
            new: true,          //If you set new: true, Mongoose will instead return the updated document (the one after applying your changes).
        }
    ).select("-password");      //removes password key from the response.

    await deleteAssetFromCloudinary(user.coverImage);  //deleting previous coverImage from cloudinary

    return res
    .status(200)
    .json(
        new ApiResponse( 200, user, "User CoverImage Updated Successfully...🎉🎉🎉")
    );
})

const getUserChannelProfile = asyncHandler( async (req, res) => {

    const {username} = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "UserName is MISSING...😔😔😔")
    }

    // User.find({username})

    const channel = await User.aggregate(
        [
            {
                $match:{
                    username: username?.toLowerCase(),
                }
            },
            {
                $lookup: {
                    from: "Subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                }
            },
            {
                $lookup: {
                    from: "Subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo",
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    channelsSubscribedTo: {
                        $size: "$SubcribedTo"
                    },
                    isSubscribed: {
                        $condition: {
                            if: { $in: [ req.user?._id, "$subscribers.subscriber" ] },
                            then: true,
                            else: false,
                        }
                    }
                }
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    channelsSubscribedTo: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1,
                }
            }
        ]
    )
    if(!channel?.length){
        throw new ApiError(404, "Channel Doesn't Exists !!! 😒😒😒");
    }

    return res
    .status(200)
    .json( new ApiResponse(200, channel[0], "User Channel Created Successfully...!!!🎊🎊🎊") );

})

const getWatchHistory = asyncHandler ( async (req, res) => {
    // req.used._id;  -->  //inside mongoDB this it is stored as --ObjectId("hdsifhewoifnr")--  when we ask for id again it gives us the string not object this is done by mongoose internally..

    const user = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._Id),
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",

                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",

                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1,
                                        }
                                    }
                                ]
                            }
                        },
                        {                       //by doing this we will be sending --owner-- object rather than an normal array normally when we add a new field it will be added as an array but now we can make it an object rather than an array
                            $addFields: {
                                owner: {
                                    $first: "$owner",    //rather than objects[] array of objects it only saves the first element of the array... as an single object.
                                }
                            }
                        }
                    ]
                }
            }
        ]
    )

    return res
    .status(200)
    .json(
        new ApiResponse (
            200, 
            user[0].watchHistory,
            "Watch History Fetched !!!...🥳🥳🥳"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
}; 