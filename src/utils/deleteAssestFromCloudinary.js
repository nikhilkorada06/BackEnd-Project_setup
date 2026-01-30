import { cloudinary } from "./cloudinary.js"; // use default export if that's how you set it up

const deleteAssetFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: "image",
    });
    console.log(result); // { result: "ok" } or { result: "not found" }
    return result;       // return so caller can handle success/failure
  } catch (error) {
    console.error("Error deleting asset from Cloudinary:", error);
    return;
  }
};

export default deleteAssetFromCloudinary;