import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"

const IntersectionObserverPage = () => (
  <div>
    <StaticImage
      data-cy="already-loaded-image"
      src="../images/cornwall.jpg"
      loading="lazy"
      layout="fixed"
      width={240}
      height={100}
      alt="cornwall"
    />

    <div style={{ height: `2100px`, background: `gray` }} />

    <StaticImage
      data-cy="lazy-loaded-image"
      src="../images/cornwall.jpg"
      loading="lazy"
      layout="fixed"
      width={260}
      height={100}
      alt="cornwall"
    />

    <div style={{ height: `5000px`, background: `gray` }} />

    <StaticImage
      data-cy="lazy-loaded-image-2"
      src="../images/cornwall.jpg"
      loading="lazy"
      layout="fixed"
      width={260}
      height={100}
      alt="cornwall"
    />
  </div>
)

export default IntersectionObserverPage
