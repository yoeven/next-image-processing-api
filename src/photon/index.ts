import { PhotonImage, Rgba, crop, padding_bottom, padding_left, padding_right, padding_top, resize } from "@cf-wasm/photon/next";
import tinycolor from "tinycolor2";

const round2dp = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

export const calculateImageSize = (
  objectFit: "contain" | "cover" | "fill" | "none" | "scale-down",
  currentWidth: number,
  currentHeight: number,
  containerWidth: number,
  containerHeight: number
) => {
  let newSize: {
    width?: number;
    height?: number;
  } = {};

  switch (objectFit) {
    case "contain":
      // Calculate dimensions while maintaining aspect ratio
      const widthRatioContain = containerWidth / currentWidth;
      const heightRatioContain = containerHeight / currentHeight;
      const scaleContain = Math.min(widthRatioContain, heightRatioContain);
      newSize = {
        width: currentWidth * scaleContain,
        height: currentHeight * scaleContain,
      };
      break;
    case "cover":
      // Calculate dimensions while maintaining aspect ratio
      const widthRatioCover = containerWidth / currentWidth;
      const heightRatioCover = containerHeight / currentHeight;
      const scaleCover = Math.max(widthRatioCover, heightRatioCover);
      const newWidthCover = currentWidth * scaleCover;
      const newHeightCover = currentHeight * scaleCover;
      // Adjust dimensions if it doesn't cover the container completely
      if (newWidthCover < containerWidth || newHeightCover < containerHeight) {
        const scaleCoverAdjusted = Math.max(containerWidth / currentWidth, containerHeight / currentHeight);
        newSize = {
          width: currentWidth * scaleCoverAdjusted,
          height: currentHeight * scaleCoverAdjusted,
        };
        break;
      }
      newSize = {
        width: newWidthCover,
        height: newHeightCover,
      };
      break;
    case "fill":
      // Stretch image to fill container
      newSize = {
        width: containerWidth,
        height: containerHeight,
      };
      break;
    case "none":
      // Keep original image size
      newSize = {
        width: currentWidth,
        height: currentHeight,
      };
      break;
    case "scale-down":
      // Calculate dimensions based on contain and none values
      const widthRatioScaleDown = containerWidth / currentWidth;
      const heightRatioScaleDown = containerHeight / currentHeight;
      const scaleScaleDown = Math.min(1, Math.min(widthRatioScaleDown, heightRatioScaleDown));
      newSize = {
        width: currentWidth * scaleScaleDown,
        height: currentHeight * scaleScaleDown,
      };
      break;
    default:
      throw new Error("Invalid object fit value");
  }

  if (!newSize?.width || !newSize?.height) {
    throw new Error("Invalid dimensions");
  }

  return {
    width: round2dp(newSize.width),
    height: round2dp(newSize.height),
  };

  // return newSize;
};

export const tinyColorToPhotonRGBA = (color: tinycolor.Instance) => {
  const rgba = color.toRgb();
  return new Rgba(rgba.r, rgba.g, rgba.b, rgba.a);
};

export const autoResize = (
  image: PhotonImage,
  newWidth?: number,
  newHeight?: number,
  options?: {
    fit?: "contain" | "cover" | "fill";
    fit_cover_letterbox_color?: tinycolor.Instance;
  }
) => {
  const currentWidth = image.get_width();
  const currentHeight = image.get_height();

  if (!newWidth && !newHeight) {
    throw new Error("At least one of width or height is required");
  }

  if (newWidth && !newHeight) {
    newHeight = Math.floor((newWidth / currentWidth) * currentHeight);
  } else if (newHeight && !newWidth) {
    newWidth = Math.floor((newHeight / currentHeight) * currentWidth);
  }

  if (!newWidth || !newHeight) {
    throw new Error("Invalid width or height");
  }

  if (newWidth == currentWidth && newHeight == currentHeight) {
    return image;
  }

  const fit = options?.fit || "cover";

  const dem = calculateImageSize(fit, currentWidth, currentHeight, newWidth, newHeight);

  image = resize(image, dem.width, dem.height, 1);

  const [updatedWidth, updatedHeight] = [image.get_width(), image.get_height()];

  if (fit === "contain" && options?.fit_cover_letterbox_color) {
    const paddingX = Math.floor((newWidth - updatedWidth) / 2);
    const paddingY = Math.floor((newHeight - updatedHeight) / 2);

    if (paddingY > 0) {
      image = padding_top(image, paddingY, tinyColorToPhotonRGBA(options.fit_cover_letterbox_color));
      image = padding_bottom(image, paddingY, tinyColorToPhotonRGBA(options.fit_cover_letterbox_color));
    }

    if (paddingX > 0) {
      image = padding_left(image, paddingX, tinyColorToPhotonRGBA(options.fit_cover_letterbox_color));
      image = padding_right(image, paddingX, tinyColorToPhotonRGBA(options.fit_cover_letterbox_color));
    }
  } else if (fit === "cover") {
    //crop to center
    const cropX = Math.floor(updatedWidth - newWidth) / 2;
    const cropY = Math.floor(updatedHeight - newHeight) / 2;

    //top left to down right
    image = crop(image, cropX, cropY, newWidth + cropX, newHeight + cropY);
  }

  return image;
};

export const imageToFormat = (
  image: PhotonImage,
  format: "webp" | "jpeg" | "png",
  options?: {
    jpeg_quality?: number;
  }
) => {
  let outputBytes: Uint8Array;

  switch (format) {
    case "webp":
      outputBytes = image.get_bytes_webp();
      break;
    default:
    case "jpeg":
      outputBytes = image.get_bytes_jpeg(options?.jpeg_quality || 100);
      break;
    case "png":
      outputBytes = image.get_bytes();
      break;
  }

  const outputBuffer = Buffer.from(outputBytes);

  return outputBuffer;
};
