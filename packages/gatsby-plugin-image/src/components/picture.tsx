import React, { type JSX, type ImgHTMLAttributes } from "react";

export type IResponsiveImageProps = {
  sizes?: string | undefined;
  srcSet: string;
};

export type SourceProps = IResponsiveImageProps &
  (
    | {
        media: string;
        type?: string | undefined;
      }
    | {
        media?: string | undefined;
        type: string;
      }
  );

type FallbackProps = {
  src: string;
  srcSet?: string | undefined;
  sizes?: string | undefined;
};

type ImageProps = {
  src: string;
  alt: string;
  sizes?: string | undefined;
  srcSet?: string | undefined;
  shouldLoad?: boolean | undefined;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "sizes" | "srcSet">;

export type PictureProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet"
> & {
  fallback?: FallbackProps | undefined;
  sources?: Array<SourceProps> | undefined;
  alt: string;
  src: string;
  srcSet?: string | undefined;
  shouldLoad?: boolean | undefined;
};

function Image({
  src,
  srcSet,
  loading,
  alt,
  shouldLoad,
  ...props
}: ImageProps): JSX.Element {
  return (
    <img
      {...props}
      decoding='async'
      loading={loading}
      src={shouldLoad ? src : undefined}
      data-src={!shouldLoad ? src : undefined}
      srcSet={shouldLoad ? srcSet : undefined}
      data-srcset={!shouldLoad ? srcSet : undefined}
      alt={alt}
    />
  );
}

export function Picture({
  fallback,
  sources = [],
  shouldLoad = true,
  ...props
}: PictureProps): JSX.Element {
  const sizes = props.sizes || fallback?.sizes;
  const fallbackImage = (
    <Image {...props} {...fallback} sizes={sizes} shouldLoad={shouldLoad} />
  );

  if (!sources.length) {
    return fallbackImage;
  }

  return (
    <picture>
      {sources.map(({ media, srcSet, type }) => (
        <source
          key={`${media}-${type}-${srcSet}`}
          type={type}
          media={media}
          srcSet={shouldLoad ? srcSet : undefined}
          data-srcset={!shouldLoad ? srcSet : undefined}
          sizes={sizes}
        />
      ))}
      {fallbackImage}
    </picture>
  );
}

Picture.displayName = "Picture";
