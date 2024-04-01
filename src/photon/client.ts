import { z } from "zod";

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
    .pipe(z.number().min(1))
    .optional(),
  height: z
    .string()
    .transform((v) => parseInt(v))
    .pipe(z.number().min(1))
    .optional(),
  fit: z.enum(["contain", "cover", "fill"]).optional(),
  fit_cover_letterbox_color: z.string().optional(),
  fliph: z
    .string()
    .transform((v) => v && v.toLowerCase() === "true")
    .optional(),
  flipv: z
    .string()
    .transform((v) => v && v.toLowerCase() === "true")
    .optional(),
  padding: z.string().optional(),
  padding_color: z.string().optional(),
  rotate: z
    .string()
    .transform((v) => parseInt(v))
    .optional(),
  crop: z.string().optional(),
  blur: z.enum(["gaussian", "box"]).optional(),
  blur_radius: z
    .string()
    .transform((v) => parseInt(v))
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
    .optional(),
  hue: z
    .string()
    .transform((v) => parseInt(v))
    .optional(),
  saturation: z
    .string()
    .transform((v) => parseInt(v))
    .optional(),
  tint: z.string().optional(),
  grayscale: z
    .string()
    .transform((v) => parseInt(v))
    .optional(),
});

export type ImageTransformParams = z.infer<typeof ImageTransformSchema>;

export const transformImage = (params: ImageTransformParams) => {
  return `/api/image?${new URLSearchParams(JSON.parse(JSON.stringify(params))).toString()}`;
};
