import { v2 as cloudinary } from "cloudinary";
import env from "../../env";

cloudinary.config({
	cloud_name: env.CLOUDINARY_CONFIG.CLOUD_NAME,
	api_key: env.CLOUDINARY_CONFIG.API_KEY,
	api_secret: env.CLOUDINARY_CONFIG.API_SECRET,
});

export async function uploadBufferToCloudinary(
	buffer: Buffer,
	folder: string,
): Promise<any> {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{ folder, resource_type: "auto" },
			(error, result) => {
				if (error) reject(error);
				else resolve(result);
			},
		);
		uploadStream.end(buffer);
	});
}
