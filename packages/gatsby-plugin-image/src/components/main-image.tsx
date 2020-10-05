import { createElement, forwardRef, Fragment } from "react"
import * as PropTypes from "prop-types"
import { Picture, PictureProps } from "./picture"

export type MainImageProps = PictureProps

export const MainImage = forwardRef<HTMLImageElement, MainImageProps>(
  function MainImage({ ...props }, ref) {
    return <Picture ref={ref} {...props} />
  }
)

MainImage.displayName = `MainImage`
MainImage.propTypes = Picture.propTypes
