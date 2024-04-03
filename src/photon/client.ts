import { z } from "zod";
import tinycolor from "tinycolor2";

const isColor = z
  .string()
  .transform((v) => tinycolor(v?.includes(",") ? `rgba(${v})` : v))
  .refine((val) => {
    console.log(val.toHex());
    return val.isValid();
  }, "Invalid color");

export const ImageTransformSchema = z.object({
  url: z.string(),
  format: z.enum(["webp", "jpeg", "png"]).optional(),
  jpeg_quality: z
    .string()
    .transform((v) => parseInt(v))
    .pipe(z.number().min(1).max(100))
    .optional(),
  width: z
    .string()
    .transform((v) => parseInt(v))
    .pipe(z.number().min(1).max(5000))
    .optional(),
  height: z
    .string()
    .transform((v) => parseInt(v))
    .pipe(z.number().min(1).max(5000))
    .optional(),
  fit: z.enum(["contain", "cover", "fill"]).optional(),
  fit_cover_letterbox_color: isColor.optional(),
  fliph: z
    .string()
    .transform((v) => v && v.toLowerCase() === "true")
    .optional(),
  flipv: z
    .string()
    .transform((v) => v && v.toLowerCase() === "true")
    .optional(),
  padding: z
    .string()
    .transform((v) => {
      const split = v.split(",").map((a) => parseFloat(a));
      if (split.length < 4) {
        const fillBy = 4 - split.length;
        for (let i = 0; i < fillBy; i++) {
          split.push(0);
        }
      }
      return split;
    })
    .pipe(z.array(z.number()).min(4).max(4))
    .optional(),
  padding_color: isColor.optional(),
  rotate: z
    .string()
    .transform((v) => parseInt(v))
    .pipe(z.number().min(0).max(360))
    .optional(),
  crop: z
    .string()
    .transform((v) => v.split(",").map((a) => parseFloat(a)))
    .pipe(z.tuple([z.number().min(0), z.number().min(0), z.number().min(1).max(5000), z.number().min(1).max(1000)]))
    .optional(),
  blur: z.enum(["gaussian", "box"]).optional(),
  blur_radius: z
    .string()
    .transform((v) => parseInt(v))
    .pipe(z.number().min(0).max(100))
    .optional(),
  sharpen: z
    .string()
    .transform((v) => v && v.toLowerCase() === "true")
    .optional(),
  noise_reduction: z
    .string()
    .transform((v) => v && v.toLowerCase() === "true")
    .optional(),
  brightness: z
    .string()
    .transform((v) => parseInt(v))
    .pipe(z.number().min(-100).max(100))
    .optional(),
  hue: z
    .string()
    .transform((v) => parseInt(v))
    .pipe(z.number().min(0).max(100))
    .optional(),
  saturation: z
    .string()
    .transform((v) => parseInt(v))
    .pipe(z.number().min(-100).max(100))
    .optional(),
  tint: isColor.optional(),
  grayscale: z
    .string()
    .transform((v) => parseInt(v))
    .pipe(z.number().min(0).max(100))
    .optional(),
});

export type ImageTransformParams = z.infer<typeof ImageTransformSchema>;

export const transformImage = (params: ImageTransformParams) => {
  return `/api/image?${new URLSearchParams(JSON.parse(JSON.stringify(params))).toString()}`;
};
