import React, {
  memo,
  type JSX,
  createElement,
  type ComponentType,
} from "react";
import { getWrapperProps, getMainProps, getPlaceholderProps } from "./hooks";
import { Placeholder } from "./placeholder";
import { MainImage, type MainImageProps } from "./main-image";
import { LayoutWrapper } from "./layout-wrapper";
import type {
  GatsbyImageProps,
  IGatsbyImageData,
} from "./gatsby-image.browser";

function removeNewLines(str: string): string {
  return str.replace(/\n/g, "");
}

function _GatsbyImage({
  as = "div",
  className,
  class: preactClass,
  style,
  image,
  loading = "lazy",
  imgClassName,
  imgStyle,
  backgroundColor,
  objectFit,
  objectPosition,
  ...props
}: GatsbyImageProps): JSX.Element | null {
  if (!image) {
    console.warn("[gatsby-plugin-image] Missing image prop");
    return null;
  }

  if (preactClass) {
    className = preactClass;
  }

  imgStyle = {
    objectFit,
    objectPosition,
    backgroundColor,
    ...imgStyle,
  };

  const {
    width,
    height,
    layout,
    images,
    placeholder,
    backgroundColor: placeholderBackgroundColor,
  } = image;

  if (!width || !height || !layout) {
    throw new Error(
      `[gatsby-plugin-image] Missing width, height or layout for image ${JSON.stringify(
        image,
      )}`,
    );
  }

  const {
    style: wStyle,
    className: wClass,
    ...wrapperProps
  } = getWrapperProps(width, height, layout);

  const cleanedImages: IGatsbyImageData["images"] = {
    fallback: undefined,
    sources: [],
  };
  if (images.fallback) {
    cleanedImages.fallback = {
      ...images.fallback,
      srcSet: images.fallback.srcSet
        ? removeNewLines(images.fallback.srcSet)
        : undefined,
    };
  }

  if (images.sources) {
    cleanedImages.sources = images.sources.map((source) => {
      return {
        ...source,
        srcSet: removeNewLines(source.srcSet),
      };
    });
  }

  return createElement(
    as,
    {
      ...wrapperProps,
      style: {
        ...wStyle,
        ...style,
        backgroundColor,
      },
      className: `${wClass}${className ? ` ${className}` : ""}`,
    },
    <LayoutWrapper layout={layout} width={width} height={height}>
      <Placeholder
        {...getPlaceholderProps(
          placeholder,
          false,
          layout,
          width,
          height,
          placeholderBackgroundColor,
          objectFit,
          objectPosition,
        )}
      />

      <MainImage
        data-gatsby-image-ssr=''
        className={imgClassName}
        {...(props as Omit<
          MainImageProps,
          "images" | "fallback" | "onError" | "onLoad"
        >)}
        // When eager is set we want to start the isLoading state on true (we want to load the img without react)
        {...getMainProps(
          loading === "eager",
          false,
          cleanedImages,
          loading,
          imgStyle,
        )}
      />
    </LayoutWrapper>,
  );
}

export const GatsbyImage: ComponentType<GatsbyImageProps> =
  memo<GatsbyImageProps>(_GatsbyImage);
