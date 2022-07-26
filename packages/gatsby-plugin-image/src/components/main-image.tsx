import React from "react"
import { Picture, PictureProps } from "./picture"

export type MainImageProps = PictureProps

export const MainImage: React.FC<PictureProps> = function MainImage(props) {
  return (
    <>
      <Picture {...props} />
      <noscript>
        <Picture {...props} shouldLoad={true} />
      </noscript>
    </>
  )
}

MainImage.displayName = `MainImage`
MainImage.propTypes = Picture.propTypes
