import cloudinary from "./cloudinary.js";

export const extractAndDestroyCloudinaryImage = async (
  url: string | null | undefined,
) => {
  if (!url || !url.includes("res.cloudinary.com")) return;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return;

    const publicIdWithExtension = parts[1]!.replace(/^v\d+\//, "");
    const publicId = publicIdWithExtension.substring(
      0,
      publicIdWithExtension.lastIndexOf("."),
    );

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary asset destruction failed:", err);
  }
};
