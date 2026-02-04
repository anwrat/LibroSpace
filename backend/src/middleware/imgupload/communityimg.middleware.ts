import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../utils/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: async(req,file)=>{
        return{
            folder: "LibroSpace/communities",
            allowed_formats: ['jpg', 'jpeg', 'png'],
        }
    },
});

export const communityImgUpload = multer({storage});