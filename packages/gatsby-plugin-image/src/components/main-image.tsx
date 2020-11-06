import React, { forwardRef } from "react"
import { Picture, PictureProps } from "./picture"

export type MainImageProps = PictureProps

export const MainImage = forwardRef<HTMLImageElement, MainImageProps>(
  function MainImage({ ...props }, ref) {
    return <Picture ref={ref} {...props} />
  }
)

MainImage.displayName = `MainImage`
MainImage.propTypes = Picture.propTypes
