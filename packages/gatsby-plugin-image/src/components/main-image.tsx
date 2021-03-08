import React, { forwardRef } from "react"
import { Picture, PictureProps } from "./picture"

export type MainImageProps = PictureProps

export const MainImage = forwardRef<HTMLImageElement, MainImageProps>(
  function MainImage(props, ref) {
    return (
      <>
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
