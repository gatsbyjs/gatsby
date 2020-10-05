/* global SERVER */
import React, {
  createElement,
  Fragment,
  FunctionComponent,
  ReactNode,
} from "react"

const terserMacro = require(`../macros/terser.macro`)

export interface LayoutWrapperProps {
  layout: "intrinsic" | "responsive" | "fixed"
  width: number
  height: number
}

const NativeScriptLoading = () => (
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

export const LayoutWrapper: FunctionComponent<LayoutWrapperProps> = function LayoutWrapper({
  layout,
  width,
  height,
  children,
}) {
  let sizer = null
  if (layout === `responsive`) {
    sizer = <div style={{ paddingTop: `${(width / height) * 100}%` }} />
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
            width: `100%`,
            display: `inline-block`,
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
