import { reportError } from "./report-error";
import type { IDuotoneArgs } from "./plugin-options";
import Sharp, {
  type AvifOptions,
  type FormatEnum,
  type GifOptions,
  type HeifOptions,
  type Jp2Options,
  type JpegOptions,
  type JxlOptions,
  type OutputOptions,
  type PngOptions,
  type TiffOptions,
  type WebpOptions,
} from "sharp";
import sharp from "sharp";

export async function duotone(
  duotone: IDuotoneArgs | undefined,
  format: keyof FormatEnum,
  pipeline: Sharp.Sharp,
): Promise<Sharp.Sharp | null> {
  const duotoneGradient = createDuotoneGradient(
    hexToRgb(duotone?.highlight),
    hexToRgb(duotone?.shadow),
  );

  const options:
    | OutputOptions
    | JpegOptions
    | PngOptions
    | WebpOptions
    | AvifOptions
    | HeifOptions
    | JxlOptions
    | GifOptions
    | Jp2Options
    | TiffOptions = {
    adaptiveFiltering: false,
    compressionLevel: 6,
    progressive: false,
    quality: 100,
  };

  try {
    const duotoneImage = await pipeline
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        for (let i = 0; i < data.length; i = i + info.channels) {
          const r = data[i + 0];
          const g = data[i + 1];
          const b = data[i + 2];

          // @see https://en.wikipedia.org/wiki/Relative_luminance
          const avg = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);

          data[i + 0] = duotoneGradient[avg][0];
          data[i + 1] = duotoneGradient[avg][1];
          data[i + 2] = duotoneGradient[avg][2];
        }

        return Sharp(data, {
          raw: info,
        }).toFormat(format, options);
      });

    if (duotone?.opacity) {
      return overlayDuotone(
        duotoneImage,
        pipeline,
        duotone.opacity,
        format,
        options,
      );
    } else {
      return duotoneImage;
    }
  } catch (err) {
    return null;
  }
}

// @see https://github.com/nagelflorian/react-duotone/blob/master/src/hex-to-rgb.js
function hexToRgb(hex: string | undefined): Array<number> | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex ?? "");
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

// @see https://github.com/nagelflorian/react-duotone/blob/master/src/create-duotone-gradient.js
function createDuotoneGradient(
  primaryColorRGB: Array<number> | null,
  secondaryColorRGB: Array<number> | null,
): Array<[number, number, number]> {
  const duotoneGradient: Array<[number, number, number]> = [];

  for (let i = 0; i < 256; i++) {
    const ratio = i / 255;
    duotoneGradient.push([
      Math.round(
        (primaryColorRGB?.[0] ?? 0) * ratio +
          (secondaryColorRGB?.[0] ?? 0) * (1 - ratio),
      ),
      Math.round(
        (primaryColorRGB?.[1] ?? 0) * ratio +
          (secondaryColorRGB?.[1] ?? 0) * (1 - ratio),
      ),
      Math.round(
        (primaryColorRGB?.[2] ?? 0) * ratio +
          (secondaryColorRGB?.[2] ?? 0) * (1 - ratio),
      ),
    ]);
  }

  return duotoneGradient;
}

async function overlayDuotone(
  duotoneImage: Sharp.Sharp,
  originalImage: Sharp.Sharp,
  opacity: number,
  format: keyof FormatEnum,
  options:
    | OutputOptions
    | JpegOptions
    | PngOptions
    | WebpOptions
    | AvifOptions
    | HeifOptions
    | JxlOptions
    | GifOptions
    | Jp2Options
    | TiffOptions,
): Promise<Sharp.Sharp> {
  const info = await duotoneImage
    .flatten()
    .metadata()
    .then((info) => info);
  // see https://github.com/lovell/sharp/issues/859#issuecomment-311319149
  const percentGrey = Math.round((opacity / 100) * 255);
  const percentTransparency = Buffer.alloc(
    (info.width ?? 0) * (info.height ?? 0),
    percentGrey,
  );

  try {
    const duotoneWithTransparency = await duotoneImage
      .joinChannel(percentTransparency, {
        raw: { width: info.width ?? 0, height: info.height ?? 0, channels: 1 },
      })
      .raw()
      .toBuffer();

    return await originalImage
      .composite([
        {
          input: duotoneWithTransparency,
          blend: "over",
          raw: {
            width: info.width ?? 0,
            height: info.height ?? 0,
            channels: 4,
          },
        },
      ])
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) =>
        sharp(data, {
          raw: info,
        }).toFormat(format, { ...options }),
      );
  } catch (err) {
    reportError(`Failed to process image ${originalImage}`, err);
    return originalImage;
  }
}
