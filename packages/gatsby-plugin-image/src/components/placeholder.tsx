import React, { FunctionComponent, ImgHTMLAttributes } from "react"
import * as PropTypes from "prop-types"
import { Picture, SourceProps } from "./picture"

export type PlaceholderProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string
  sources?: Array<SourceProps>
}

function isEqual(
  prevProps: PlaceholderProps,
  nextProps: PlaceholderProps
): boolean {
  return (
    prevProps.fallback === nextProps.fallback &&
    JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style)
  )
}

export const Placeholder: FunctionComponent<PlaceholderProps> = React.memo(
  function Placeholder({ fallback, ...props }) {
    console.log({ props })
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
  },
  isEqual
)

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
