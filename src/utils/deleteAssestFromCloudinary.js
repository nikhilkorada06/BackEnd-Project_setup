import { ApiError } from "./ApiErrors.js";
import { cloudinary } from "../models/cloudinary.js"; // use default export if that's how you set it up

const deleteAssetFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: "auto",
    });
    console.log(result); // { result: "ok" } or { result: "not found" }
    return result;       // return so caller can handle success/failure
  } catch (error) {
    throw new ApiError(
      500,
      "Error While Deleting Asset From Cloudinary...😔😔😔"
    );
  }
};

export default deleteAssetFromCloudinary;