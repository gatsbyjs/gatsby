/* global SERVER */
import React, { Fragment, FunctionComponent } from "react"
import terserMacro from "../../macros/terser.macro"
import { Layout } from "../utils"

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

export const LayoutWrapper: FunctionComponent<ILayoutWrapperProps> = function LayoutWrapper({
  layout,
  width,
  height,
  children,
}) {
  let sizer: JSX.Element | null = null
  if (layout === `responsive`) {
    sizer = (
      <div aria-hidden style={{ paddingTop: `${(width / height) * 100}%` }} />
    )
  }
  if (layout === `intrinsic`) {
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
      {SERVER && <NativeScriptLoading />}
    </Fragment>
  )
}
