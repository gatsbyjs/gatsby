import React from "react"
import Img from "gatsby-image"
import numeral from "numeral"

import { options, scale } from "../utils/typography"
import presets from "../utils/presets"

const UnsplashMasonry = edges => (
  <div
    css={{
      background: `white`,
      margin: `0 -`,
      [presets.Tablet]: {
        margin: `0 0 0 calc(-${presets.offset}vw - ${presets.gutter.tablet}px)`,
        padding: 100,
        paddingRight: 0,
      },
      [presets.Desktop]: {
        margin: `0 0 0 calc(-${presets.offset}vw - ${
          presets.gutter.desktop
        }px)`,
      },
    }}
  >
    <div
      css={{
        columnCount: 1,
        columnGap: 0,
        margin: `0 auto`,
        [presets.Mobile]: {
          columnCount: 2,
        },
        [presets.Tablet]: {
          columnCount: 3,
        },
        [presets.Hd]: {
          columnCount: 4,
        },
      }}
    >
      {edges.images.map((image, index) => (
        <div
          key={index}
          css={{
            border: `4px solid transparent`,
            breakInside: `avoid`,
            position: `relative`,
            [presets.Mobile]: {
              borderWidth: 8,
            },
            [presets.Desktop]: {
              borderWidth: 12,
            },
            "& img": {
              borderRadius: 2,
            },
            "& .gatsby-image-wrapper:hover": {
              "& div + img": {
                opacity: `1 !important`,
                transition: `none !important`,
              },
              "& img + picture > img": {
                opacity: `0 !important`,
              },
              "& span": {
                opacity: `1 !important`,
              },
            },
          }}
        >
          <Img fluid={image.node.childImageSharp.fluid} />
          <span
            css={{
              ...scale(-1),
              color: options.bodyColor,
              position: `absolute`,
              bottom: 10,
              right: 10,
              padding: `.25rem`,
              background: `#fff`,
              borderRadius: 2,
              lineHeight: 1,
              opacity: 0.5,
              fontFamily: options.monospaceFontFamily.join(`,`),
            }}
          >
            <span css={{ color: options.headerColor }}>SVG</span>
            {` `}
            {numeral(
              Buffer.byteLength(
                image.node.childImageSharp.fluid.tracedSVG,
                `utf8`
              )
            ).format()}
            {` `}B
          </span>
        </div>
      ))}
    </div>
  </div>
)

export default UnsplashMasonry
