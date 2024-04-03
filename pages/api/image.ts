import { NextRequest, NextResponse } from "next/server";
import {
  PhotonImage,
  box_blur,
  crop,
  fliph,
  flipv,
  gaussian_blur,
  grayscale_shades,
  hue_rotate_hsl,
  inc_brightness,
  noise_reduction,
  padding_bottom,
  padding_left,
  padding_right,
  padding_top,
  padding_uniform,
  rotate,
  saturate_hsl,
  desaturate_hsl,
  sharpen,
  tint,
  darken_hsl,
} from "@cf-wasm/photon/next";
import { ImageTransformSchema } from "src/photon/client";
import { autoResize, imageToFormat, tinyColorToPhotonRGBA } from "src/photon";
import tinycolor from "tinycolor2";

export const config = {
  runtime: "edge",
  unstable_allowDynamic: ["**/node_modules/@cf-wasm/photon/**/*.js"],
};

const handler = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());
    const { url, ...params } = ImageTransformSchema.parse(queryParams);

    console.log("params", params);

    const imageUrl = url?.startsWith("/") ? `${req.nextUrl.origin}${url}` : url;

    if (!imageUrl) {
      throw new Error(`Image URL is required`);
    }

    const imageResp = await fetch(imageUrl);

    if (!imageResp.ok) {
      throw new Error(`Failed to fetch image`);
    }

    const contentType = imageResp.headers.get("content-type");
    const ext = imageUrl.split(".").pop()?.toLowerCase();
    const isImage = contentType?.startsWith("image") || (ext && ["png", "jpg", "jpeg", "webp"].includes(ext));

    if (!isImage) {
      throw new Error("Content is not an image");
    }

    const bytes = await imageResp.arrayBuffer().then((buffer) => new Uint8Array(buffer));

    if (Object.keys(params).length === 0) {
      console.log("No params, returning original image");
      return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: {
          "Content-Type": contentType || "image/jpeg",
          "cache-control": "public, s-maxage=2592000",
        },
      });
    }

    let outputImage = PhotonImage.new_from_byteslice(bytes);

    if (params.width || params.height) {
      outputImage = autoResize(outputImage, params?.width, params?.height, {
        fit: params?.fit,
        fit_cover_letterbox_color: params?.fit_cover_letterbox_color,
      });
    }

    if (params.fliph) {
      fliph(outputImage);
    }

    if (params.flipv) {
      flipv(outputImage);
    }

    if (params.padding) {
      const paddingSplit = params.padding.split(",").map((a) => parseFloat(a));

      if (paddingSplit.length < 4) {
        const fillBy = 4 - paddingSplit.length;
        for (let i = 0; i < fillBy; i++) {
          paddingSplit.push(0);
        }
      }

      const [top, right, bottom, left] = paddingSplit;

      const color = params?.padding_color || tinycolor("black");

      if (paddingSplit.every((val, i, arr) => val === arr[0])) {
        outputImage = padding_uniform(outputImage, top, tinyColorToPhotonRGBA(color));
      } else {
        if (top) {
          outputImage = padding_top(outputImage, top, tinyColorToPhotonRGBA(color));
        }

        if (right) {
          outputImage = padding_right(outputImage, right, tinyColorToPhotonRGBA(color));
        }

        if (bottom) {
          outputImage = padding_bottom(outputImage, bottom, tinyColorToPhotonRGBA(color));
        }

        if (left) {
          outputImage = padding_left(outputImage, left, tinyColorToPhotonRGBA(color));
        }
      }
    }

    if (params.rotate) {
      outputImage = rotate(outputImage, params.rotate);
    }

    if (params.crop) {
      const cropSplit = params.crop.split(",").map((a) => parseFloat(a));
      const [x, y, cropWidth, cropHeight] = cropSplit;
      outputImage = crop(outputImage, x, y, cropWidth, cropHeight);
    }

    if (params.blur) {
      if (params.blur === "gaussian") {
        gaussian_blur(outputImage, params.blur_radius || 1);
      } else if (params.blur === "box") {
        box_blur(outputImage);
      }
    }

    if (params.sharpen) {
      sharpen(outputImage);
    }

    if (params.noise_reduction) {
      noise_reduction(outputImage);
    }

    if (params.brightness) {
      if (params.brightness < 0) {
        darken_hsl(outputImage, Math.abs(params.brightness) / 100);
      } else {
        inc_brightness(outputImage, params.brightness);
      }
    }

    if (params.hue) {
      hue_rotate_hsl(outputImage, Math.abs(params.hue) / 100);
    }

    if (params.saturation) {
      if (params.saturation < 0) {
        desaturate_hsl(outputImage, Math.abs(params.saturation) / 100);
      } else {
        saturate_hsl(outputImage, Math.abs(params.saturation) / 100);
      }
    }

    if (params.tint) {
      const colorRGB = params.tint.toRgb();
      tint(outputImage, colorRGB.r, colorRGB.g, colorRGB.b);
    }

    if (params.grayscale) {
      grayscale_shades(outputImage, params.grayscale);
    }

    const format = params.format || imageResp.headers.get("Content-Type")?.split("/")?.[1] || "jpeg";
    const outputBuffer = imageToFormat(outputImage, format as any, {
      jpeg_quality: params?.jpeg_quality,
    });
    const [outputWidth, outputHeight] = [outputImage.get_width(), outputImage.get_height()];
    outputImage.free();

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": `image/${format}`,
        "cache-control": "public, s-maxage=2592000",
        "x-image-width": outputWidth.toString(),
        "x-image-height": outputHeight.toString(),
      },
    });
  } catch (error: any) {
    console.error("error", error);
    return NextResponse.json(error?.message || error, {
      status: 400,
    });
  }
};

export default handler;
