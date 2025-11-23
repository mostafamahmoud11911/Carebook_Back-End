import { Request } from "express";
import uploadOnCloudinary, { destroyFromCloudinary } from "./cloudinary";

export async function handleUploadImage(req: Request) {
  let attachmentUrl: string = "";
  let attachmentUrls: string[] = [];
  console.log(req.files);
  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files["image"] && files["image"].length > 0) {
      const result = await uploadOnCloudinary(files["image"][0].path);
      if (result?.secure_url) attachmentUrl = result.secure_url;
    }

    if (files["images"] && files["images"].length > 0) {
      const uploadPromises = files["images"].map((file) =>
        uploadOnCloudinary(file.path)
      );
      const results = await Promise.all(uploadPromises);

      attachmentUrls = results.map((res) => res?.secure_url) as string[];
    }
  }
  return { attachmentUrl, attachmentUrls };
}

export async function handleEditImage(req: Request, model: any) {
  let attachmentUrl: string = model.image || "";
  let attachmentUrls: string[] = Array.isArray(model.images)
    ? [...model.images]
    : [];

  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (
      files["image"] &&
      Array.isArray(files["image"]) &&
      files["image"].length > 0
    ) {
      if (model.image) {
        await destroyFromCloudinary(model.image);
      }
      const result = await uploadOnCloudinary(files["image"][0].path);
      if (result?.secure_url) {
        attachmentUrl = result.secure_url;
      }
    }

    if (
      files["images"] &&
      Array.isArray(files["images"]) &&
      files["images"].length > 0
    ) {
      const uploadPromises = files["images"].map((file) =>
        uploadOnCloudinary(file.path)
      );
      const results = await Promise.all(uploadPromises);

      const newUrls = results
        .map((res) => res?.secure_url)
        .filter(Boolean) as string[];

      if (newUrls.length > 0) {
        let oldImages: string[] = [];
        if (Array.isArray(model.images)) {
          oldImages = model.images;
        } else if (typeof model.images === "string") {
          try {
            oldImages = JSON.parse(model.images);
          } catch {
            oldImages = [];
          }
        }

        if (oldImages.length) {
          await Promise.all(
            oldImages.map((img: string) => destroyFromCloudinary(img))
          );
        }

        attachmentUrls = newUrls;
      }
    }
  }

  return { attachmentUrl, attachmentUrls };
}
