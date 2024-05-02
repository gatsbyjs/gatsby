import sharp from "sharp";
import fs from "fs-extra";
// import type { Reporter } from "gatsby/reporter";
import type { IImageMetadata } from "./image-data";
import type { ITransformArgs } from "./plugin-options";
// import type { Fit } from "gatsby-plugin-image";

export function rgbToHex(red: number, green: number, blue: number): string {
  return `#${(blue | (green << 8) | (red << 16) | (1 << 24))
    .toString(16)
    .slice(1)}`;
}

const DEFAULT_PIXEL_DENSITIES = [0.25, 0.5, 1, 2];
const DEFAULT_FLUID_SIZE = 800;

function dedupeAndSortDensities(values: Array<number>): Array<number> {
  return Array.from(new Set([1, ...values])).sort();
}

export function calculateImageSizes(args: {
  width?: number | undefined;
  height?: number | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: any;
  layout?: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reporter?: any | undefined; // Reporter | undefined;
  imgDimensions?: IImageMetadata | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformOptions?: { fit?: any | undefined } | undefined;
  outputPixelDensities?: Array<number> | undefined;
  breakpoints?: Array<number> | undefined;
}): {
  sizes: Array<number>;
  aspectRatio: number;
  presentationWidth: number;
  presentationHeight: number;
  unscaledWidth: number;
} | null {
  const { width, height, file, layout, reporter } = args;

  // check that all dimensions provided are positive
  const userDimensions = { width, height };
  const erroneousUserDimensions = Object.entries(userDimensions).filter(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_, size]) => {
      return typeof size === "number" && size < 1;
    },
  );
  if (erroneousUserDimensions.length) {
    throw new Error(
      `Specified dimensions for images must be positive numbers (> 0). Problem dimensions you have are ${erroneousUserDimensions
        .map((dim) => dim.join(": "))
        .join(", ")}`,
    );
  }

  if (layout === "fixed") {
    return fixedImageSizes(args);
  } else if (layout === "fullWidth" || layout === "constrained") {
    return responsiveImageSizes(args);
  } else {
    reporter?.warn(
      `No valid layout was provided for the image at ${file.absolutePath}. Valid image layouts are fixed, fullWidth, and constrained.`,
    );

    return null;
  }
}

export function fixedImageSizes({
  file,
  imgDimensions,
  width,
  height,
  transformOptions = {},
  outputPixelDensities = DEFAULT_PIXEL_DENSITIES,
  reporter,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: any;
  imgDimensions?: IImageMetadata | undefined;
  width?: number | undefined;
  height?: number | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformOptions?: { fit?: any | undefined } | undefined;
  outputPixelDensities?: Array<number> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reporter?: any | undefined; // Reporter | undefined;
}): {
  sizes: Array<number>;
  aspectRatio: number;
  presentationWidth: number;
  presentationHeight: number;
  unscaledWidth: number;
} {
  let aspectRatio = (imgDimensions?.width ?? 0) / (imgDimensions?.height ?? 1);
  const { fit = "cover" } = transformOptions;
  // Sort, dedupe and ensure there's a 1
  const densities = dedupeAndSortDensities(outputPixelDensities);

  // If both are provided then we need to check the fit
  if (width && height) {
    const calculated = getDimensionsAndAspectRatio(imgDimensions, {
      width,
      height,
      fit,
    });
    width = calculated.width;
    height = calculated.height;
    aspectRatio = calculated.aspectRatio;
  }
  if (!width && !height) {
    width = 400;
  }

  // if no width is passed, we need to resize the image based on the passed height
  if (!width) {
    width = Math.round((height ?? 0) * aspectRatio);
  }

  const originalWidth = width; // will use this for presentationWidth, don't want to lose it
  const isTopSizeOverriden =
    (imgDimensions?.width ?? 0) < width ||
    (imgDimensions?.height ?? 0) < (height ?? 0);

  // If the image is smaller than what's requested, warn the user that it's being processed as such
  // print out this message with the necessary information before we overwrite it for sizing
  if (isTopSizeOverriden) {
    const fixedDimension =
      (imgDimensions?.width ?? 0) < width ? "width" : "height";
    reporter?.warn(`
      The requested ${fixedDimension} "${
        fixedDimension === "width" ? width : height
      }px" for a resolutions field for
      the file ${file.absolutePath}
      was larger than the actual image ${fixedDimension} of ${
        imgDimensions?.[fixedDimension] ?? 0
      }px!
      If possible, replace the current image with a larger one.
    `);

    if (fixedDimension === "width") {
      width = imgDimensions?.width ?? 0;
      height = Math.round(width / aspectRatio);
    } else {
      height = imgDimensions?.height ?? 0;
      width = height * aspectRatio;
    }
  }

  const sizes = densities
    .filter((size) => size >= 1) // remove smaller densities because fixed images don't need them
    .map((density) => Math.round(density * width))
    .filter((size) => size <= (imgDimensions?.width ?? 0));

  return {
    sizes,
    aspectRatio,
    presentationWidth: originalWidth,
    presentationHeight: Math.round(originalWidth / aspectRatio),
    unscaledWidth: width,
  };
}

export function responsiveImageSizes({
  imgDimensions,
  width,
  height,
  transformOptions = {},
  outputPixelDensities = DEFAULT_PIXEL_DENSITIES,
  breakpoints,
  layout,
}: {
  imgDimensions?: IImageMetadata | undefined;
  width?: number | undefined;
  height?: number | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformOptions?: { fit?: any | undefined } | undefined;
  outputPixelDensities?: Array<number> | undefined;
  breakpoints?: Array<number> | undefined;
  layout?: string | undefined;
}): {
  sizes: Array<number>;
  aspectRatio: number;
  presentationWidth: number;
  presentationHeight: number;
  unscaledWidth: number;
} {
  const { fit = "cover" } = transformOptions;

  let sizes: Array<number>;
  let aspectRatio = (imgDimensions?.width ?? 0) / (imgDimensions?.height ?? 1);
  // Sort, dedupe and ensure there's a 1
  const densities = dedupeAndSortDensities(outputPixelDensities);

  // If both are provided then we need to check the fit
  if (width && height) {
    const calculated = getDimensionsAndAspectRatio(imgDimensions, {
      width: width,
      height: height,
      fit,
    });
    width = calculated.width;
    height = calculated.height;
    aspectRatio = calculated.aspectRatio;
  }

  // Case 1: width or height were passed in, make sure it isn't larger than the actual image
  width = width && Math.min(width, imgDimensions?.width ?? 0);
  height = height && Math.min(height, imgDimensions?.height ?? 0);

  // Case 2: neither width or height were passed in, use default size
  if (!width && !height) {
    width = Math.min(DEFAULT_FLUID_SIZE, imgDimensions?.width ?? 0);
    height = width / aspectRatio;
  }

  // if it still hasn't been found, calculate width from the derived height
  if (!width) {
    width = (height ?? 0) * aspectRatio;
  }

  const originalWidth = width;
  const isTopSizeOverriden =
    (imgDimensions?.width ?? 0) < width ||
    (imgDimensions?.height ?? 0) < (height ?? 0);
  if (isTopSizeOverriden) {
    width = imgDimensions?.width ?? 0;
    height = imgDimensions?.height ?? 0;
  }

  width = Math.round(width);

  if ((breakpoints?.length ?? 0) > 0) {
    sizes =
      breakpoints?.filter((size) => size <= (imgDimensions?.width ?? 0)) ?? [];

    // If a larger breakpoint has been filtered-out, add the actual image width instead
    if (
      sizes.length < (breakpoints?.length ?? 0) &&
      !sizes.includes(imgDimensions?.width ?? 0)
    ) {
      sizes.push(imgDimensions?.width ?? 0);
    }
  } else {
    sizes = densities.map((density) => Math.round(density * width));
    sizes = sizes.filter((size) => size <= (imgDimensions?.width ?? 0));
  }

  // ensure that the size passed in is included in the final output
  if (layout === "constrained" && !sizes.includes(width)) {
    sizes.push(width);
  }
  sizes = sizes.sort((a, b) => a - b);
  return {
    sizes,
    aspectRatio,
    presentationWidth: originalWidth,
    presentationHeight: Math.round(originalWidth / aspectRatio),
    unscaledWidth: width,
  };
}

export function getSizes(
  width: number | undefined,
  layout?: string | undefined,
): string | undefined {
  switch (layout) {
    // If screen is wider than the max size, image width is the max size,
    // otherwise it's the width of the screen
    case "constrained":
      return `(min-width: ${width}px) ${width}px, 100vw`;

    // Image is always the same width, whatever the size of the screen
    case "fixed":
      return `${width}px`;

    // Image is always the width of the screen
    case "fullWidth":
      return "100vw";

    default:
      return undefined;
  }
}

export function getSrcSet(
  images: Array<{ src: string; width?: number | undefined }>,
): string {
  return images.map((image) => `${image.src} ${image.width}w`).join(",\n");
}

export function getDimensionsAndAspectRatio(
  dimensions: IImageMetadata | undefined,
  options: Partial<ITransformArgs>,
): {
  width?: number | undefined;
  height?: number | undefined;
  aspectRatio: number;
} {
  // Calculate the eventual width/height of the image.
  const imageAspectRatio = (dimensions?.width ?? 0) / (dimensions?.height ?? 1);

  let width = options.width;
  let height = options.height;

  switch (options.fit) {
    case sharp.fit.fill: {
      width = options.width ? options.width : dimensions?.width ?? 0;
      height = options.height ? options.height : dimensions?.height ?? 0;
      break;
    }
    case sharp.fit.inside: {
      const widthOption = options.width
        ? options.width
        : Number.MAX_SAFE_INTEGER;
      const heightOption = options.height
        ? options.height
        : Number.MAX_SAFE_INTEGER;

      width = Math.min(
        widthOption,
        Math.round(heightOption * imageAspectRatio),
      );
      height = Math.min(
        heightOption,
        Math.round(widthOption / imageAspectRatio),
      );
      break;
    }
    case sharp.fit.outside: {
      const widthOption = options.width ? options.width : 0;
      const heightOption = options.height ? options.height : 0;

      width = Math.max(
        widthOption,
        Math.round(heightOption * imageAspectRatio),
      );
      height = Math.max(
        heightOption,
        Math.round(widthOption / imageAspectRatio),
      );
      break;
    }

    default: {
      if (options.width && !options.height) {
        width = options.width;
        height = Math.round(options.width / imageAspectRatio);
      }

      if (options.height && !options.width) {
        width = Math.round(options.height * imageAspectRatio);
        height = options.height;
      }
    }
  }

  return {
    width,
    height,
    aspectRatio: (width ?? 0) / (height ?? 1),
  };
}

const dominantColorCache = new Map();

export async function getDominantColor(
  absolutePath: fs.PathLike,
): Promise<string> {
  let dominantColor = dominantColorCache.get(absolutePath);
  if (dominantColor) {
    return dominantColor;
  }

  const pipeline = sharp();

  fs.createReadStream(absolutePath).pipe(pipeline);

  const { dominant } = await pipeline.stats();

  // Fallback in case sharp doesn't support dominant
  dominantColor = dominant
    ? rgbToHex(dominant.r, dominant.g, dominant.b)
    : "rgba(0,0,0,0.5)";

  dominantColorCache.set(absolutePath, dominantColor);

  return dominantColor;
}
