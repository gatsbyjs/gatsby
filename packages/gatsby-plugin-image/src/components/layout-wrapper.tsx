import React, { Fragment, FunctionComponent, PropsWithChildren } from "react"
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

    const sources = mainImage.parentNode.querySelectorAll('source[data-srcset]');
    for (let source of sources) {
      source.setAttribute('srcset', source.dataset.srcset)
      source.removeAttribute('data-srcset')
    }

    if (mainImage.complete) {
      mainImage.style.opacity = 1;

      // also hide the placeholder
      mainImage.parentNode.parentNode.querySelector('[data-placeholder-image]').style.opacity = 0;
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
  let sizer = ``
  if (layout === `fullWidth`) {
    sizer = `<div aria-hidden="true" style="padding-top: ${
      (height / width) * 100
    }%;"></div>`
  }

  if (layout === `constrained`) {
    sizer = `<div style="max-width: ${width}px; display: block;"><img alt="" role="presentation" aria-hidden="true" src="data:image/svg+xml;charset=utf-8,%3Csvg%20height='${height}'%20width='${width}'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E" style="max-width: 100%; display: block; position: static;"></div>`
  }

  return sizer
}

const Sizer: FunctionComponent<ILayoutWrapperProps> = function Sizer({
  layout,
  width,
  height,
}) {
  if (layout === `fullWidth`) {
    return (
      <div aria-hidden style={{ paddingTop: `${(height / width) * 100}%` }} />
    )
  }

  if (layout === `constrained`) {
    return (
      <div style={{ maxWidth: width, display: `block` }}>
        <img
          alt=""
          role="presentation"
          aria-hidden="true"
          src={`data:image/svg+xml;charset=utf-8,%3Csvg%20height='${height}'%20width='${width}'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E`}
          style={{
            maxWidth: `100%`,
            display: `block`,
            position: `static`,
          }}
        />
      </div>
    )
  }

  return null
}

export const LayoutWrapper: FunctionComponent<
  PropsWithChildren<ILayoutWrapperProps>
> = function LayoutWrapper({ children, ...props }) {
  return (
    <Fragment>
      <Sizer {...props} />
      {children}

      {SERVER ? <NativeScriptLoading /> : null}
    </Fragment>
  )
}
