// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />

import React, { Fragment, FunctionComponent, ReactElement } from "react"
import terserMacro from "../../macros/terser.macro"
import { Layout } from "../image-utils"

export interface ILayoutWrapperProps {
  layout: Layout
  width: number
  height: number
}

const NativeScriptLoading: FunctionComponent = () => (
  <script
    type="module"
    dangerouslySetInnerHTML={{
      __html: terserMacro`
const hasNativeLazyLoadSupport = typeof HTMLImageElement !== "undefined" && "loading" in HTMLImageElement.prototype;
if (hasNativeLazyLoadSupport) {
  const gatsbyImages = document.querySelectorAll('img[data-main-image]');
  for (let mainImage of gatsbyImages) {
    if (mainImage.dataset.src) {
      mainImage.setAttribute('src', mainImage.dataset.src)
      mainImage.removeAttribute('data-src')
    }
    if (mainImage.dataset.srcset) {
      mainImage.setAttribute('srcset', mainImage.dataset.srcset)
      mainImage.removeAttribute('data-srcset')
    }

    if (mainImage.complete) {
      mainImage.style.opacity = 1;
    }
  }
}
`,
    }}
  />
)

export function getSizer(
  layout: Layout,
  width: number,
  height: number
): string {
  let sizer: string | null = null
  if (layout === `fullWidth`) {
    sizer = `<div aria-hidden="true" style="padding-top: ${
      (height / width) * 100
    }%;"></div>`
  }
  if (layout === `constrained`) {
    sizer = `<div style="max-width: ${width}px; display: block;"><img alt="" role="presentation" aria-hidden="true" src="data:image/svg+xml;charset=utf-8,%3Csvg height='${height}' width='${width}' xmlns='http://www.w3.org/2000/svg' version='1.1'%3E%3C/svg%3E" style="max-width: 100%; display: block; position: static;"></div>`
  }
  return sizer
}

export const LayoutWrapper: FunctionComponent<ILayoutWrapperProps> = function LayoutWrapper({
  layout,
  width,
  height,
  children,
}) {
  let sizer: ReactElement | null = null
  if (layout === `fullWidth`) {
    sizer = (
      <div aria-hidden style={{ paddingTop: `${(height / width) * 100}%` }} />
    )
  }
  if (layout === `constrained`) {
    sizer = (
      <div style={{ maxWidth: width, display: `block` }}>
        <img
          alt=""
          role="presentation"
          aria-hidden="true"
          src={`data:image/svg+xml;charset=utf-8,%3Csvg height='${height}' width='${width}' xmlns='http://www.w3.org/2000/svg' version='1.1'%3E%3C/svg%3E`}
          style={{
            maxWidth: `100%`,
            display: `block`,
            position: `static`,
          }}
        />
      </div>
    )
  }
  return (
    <Fragment>
      {sizer}
      {children}

      {
        // eslint-disable-next-line no-undef
        SERVER && <NativeScriptLoading />
      }
    </Fragment>
  )
}
