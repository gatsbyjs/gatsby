import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"

export default function NativeLazyLoadingPage() {
  return (
    <div>
      <StaticImage
        data-cy="already-loaded"
        src="../../images/citrus-fruits.jpg"
        width={124}
        height={59}
        alt="Citrus fruits"
        loading="lazy"
        formats={["jpg"]}
      />

      <div style={{ height: `5000px`, background: `#F4F4F4` }} />

      <StaticImage
        data-cy="lazy-loaded"
        src="../../images/cornwall.jpg"
        width={126}
        height={59}
        alt="Citrus fruits"
        loading="lazy"
        formats={["jpg"]}
      />
    </div>
  )
}
