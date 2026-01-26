import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/register").post(
    // (req, res, next) => {
    //     console.log("Register route hit from user.routes.js");
    //     next();
    // },

    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    
    registerUser

);
     
                                                        //url - http://localhost:8000/api/v1/users/register
// router.route("/login").post(login);                  //url - http://localhost:8000/api/v1/users/login

export default router;