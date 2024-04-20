// eslint-disable-next-line @typescript-eslint/naming-convention
import React, { type JSX, type ComponentType, memo } from "react"
import { Picture, type PictureProps } from "./picture"

export type MainImageProps = PictureProps

function _MainImage(props: MainImageProps): JSX.Element {
  return (
    <>
      <Picture {...props} />
      <noscript>
        <Picture {...props} shouldLoad={true} />
      </noscript>
    </>
  )
}

export const MainImage: ComponentType<MainImageProps> =
  memo<MainImageProps>(_MainImage)

MainImage.displayName = `MainImage`
MainImage.propTypes = Picture.propTypes
