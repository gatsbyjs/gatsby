import React, { forwardRef } from "react"
import { Picture, PictureProps } from "./picture"

export type MainImageProps = PictureProps

export const MainImage = forwardRef<HTMLImageElement, MainImageProps>(
  function MainImage({ ...props }, ref) {
    return (
      <>
        {props.loading === `eager` && (
          <link
            rel="preload"
            as="image"
            href={props.fallback.src}
            // TODO: remove this if imagesrcset is added to the types
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            imagesrcset={props.fallback.srcSet}
            imagesizes={props.fallback.sizes}
          />
        )}
        <Picture ref={ref} {...props} />
        <noscript>
          <Picture {...props} shouldLoad={true} />
        </noscript>
      </>
    )
  }
)

MainImage.displayName = `MainImage`
MainImage.propTypes = Picture.propTypes
