import React, { FunctionComponent, ImgHTMLAttributes } from "react"
import * as PropTypes from "prop-types"
import { Picture, SourceProps } from "./picture"

export type PlaceholderProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string
  sources?: Array<SourceProps>
}

export const Placeholder: FunctionComponent<PlaceholderProps> =
  function Placeholder({ fallback, ...props }) {
    if (fallback) {
      return (
        <Picture
          {...props}
          fallback={{
            src: fallback,
          }}
          aria-hidden
          alt=""
        />
      )
    } else {
      return <div {...props}></div>
    }
  }

Placeholder.displayName = `Placeholder`
Placeholder.propTypes = {
  fallback: PropTypes.string,
  sources: Picture.propTypes?.sources,
  alt: function (props, propName, componentName): Error | null {
    if (!props[propName]) {
      return null
    }

    return new Error(
      `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`
    )
  },
}
