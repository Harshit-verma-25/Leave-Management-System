"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});
export async function uploadImage(
  base64: string,
  name: string,
  folderName: string
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: folderName,
      public_id: name,
      overwrite: true,
      allowed_formats: ["jpg", "png", "jpeg", "pdf"],
      resource_type: "auto",
    });

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}
