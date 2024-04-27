import React, {
  type FunctionComponent,
  type ComponentType,
  type ReactElement,
} from "react";
import { GatsbyImage as GatsbyImageServer } from "./gatsby-image.server";
import type {
  GatsbyImageProps,
  IGatsbyImageData,
} from "./gatsby-image.browser";
import type { ISharpGatsbyImageArgs } from "../image-utils";

export type IStaticImageProps = {
  src: string;
  filename?: string | undefined;
} & Omit<GatsbyImageProps, "image"> &
  Omit<ISharpGatsbyImageArgs, "backgroundColor">;

// These values are added by Babel. Do not add them manually
type IPrivateProps = {
  __imageData?: IGatsbyImageData | undefined;
  __error?: string | undefined;
};

export function _getStaticImage(
  GatsbyImage: ComponentType<GatsbyImageProps>,
): FunctionComponent<IStaticImageProps & IPrivateProps> | null {
  function StaticImage({
    src,
    __imageData: imageData,
    __error,
    // We extract these because they're not meant to be passed-down to GatsbyImage
    /* eslint-disable @typescript-eslint/no-unused-vars */
    width,
    height,
    aspectRatio,
    tracedSVGOptions,
    placeholder,
    formats,
    quality,
    transformOptions,
    jpgOptions,
    pngOptions,
    webpOptions,
    avifOptions,
    blurredOptions,
    breakpoints,
    outputPixelDensities,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    ...props
  }: IStaticImageProps & IPrivateProps): ReactElement | null {
    if (__error) {
      console.warn(__error);
    }

    if (imageData) {
      return <GatsbyImage image={imageData} {...props} />;
    }
    console.warn("Image not loaded", src);
    if (!__error && process.env.NODE_ENV === "development") {
      console.warn(
        'Please ensure that "gatsby-plugin-image" is included in the plugins array in gatsby-config.js, and that your version of gatsby is at least 2.24.78',
      );
    }

    return null;
  }

  StaticImage.displayName = "StaticImage";

  return StaticImage;
}

export const StaticImage: ComponentType<
  IStaticImageProps & IPrivateProps
> | null = _getStaticImage(GatsbyImageServer);
