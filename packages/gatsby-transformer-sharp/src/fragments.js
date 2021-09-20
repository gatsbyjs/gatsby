/* eslint-disable */
import { graphql } from "gatsby"

/**
 * The simplest set of fields for fixed sharp images
 * @type {Fragment}
 * @example
 * childImageSharp {
 *   fixed {
 *     ...GatsbyImageSharpFixed
 *     # ^ identical to using the following fields:
 *     # base64
 *     # width
 *     # height
 *     # src
 *     # srcSet
 *   }
 * }
 */
export const GatsbyImageSharpFixed = graphql`
  fragment GatsbyImageSharpFixed on ImageSharpFixed {
    base64
    width
    height
    src
    srcSet
  }
`

/**
 * Traced SVG fixed images
 * @type {Fragment}
 */
export const GatsbyImageSharpFixed_tracedSVG = graphql`
  fragment GatsbyImageSharpFixed_tracedSVG on ImageSharpFixed {
    tracedSVG
    width
    height
    src
    srcSet
  }
`

/**
 * Images using Webp for fixed images
 * @type {Fragment}
 */
export const GatsbyImageSharpFixed_withWebp = graphql`
  fragment GatsbyImageSharpFixed_withWebp on ImageSharpFixed {
    base64
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

/**
 * Traced SVG images using Webp for fixed images
 * @type {Fragment}
 */
export const GatsbyImageSharpFixed_withWebp_tracedSVG = graphql`
  fragment GatsbyImageSharpFixed_withWebp_tracedSVG on ImageSharpFixed {
    tracedSVG
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

/**
 * Fixed images without the blurred base64 image
 * @type {Fragment}
 */
export const GatsbyImageSharpFixed_noBase64 = graphql`
  fragment GatsbyImageSharpFixed_noBase64 on ImageSharpFixed {
    width
    height
    src
    srcSet
  }
`

/**
 * Fixed images without the blurred base64 image preferring Webp
 * @type {Fragment}
 */
export const GatsbyImageSharpFixed_withWebp_noBase64 = graphql`
  fragment GatsbyImageSharpFixed_withWebp_noBase64 on ImageSharpFixed {
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

/**
 * The simplest set of fields for fluid images
 * @type {Fragment}
 */
export const GatsbyImageSharpFluid = graphql`
  fragment GatsbyImageSharpFluid on ImageSharpFluid {
    base64
    aspectRatio
    src
    srcSet
    sizes
  }
`

/**
 * Presentation sizes to make sure a fluid container does not overflow
 * @type {Fragment}
 */
export const GatsbyImageSharpFluidLimitPresentationSize = graphql`
  fragment GatsbyImageSharpFluidLimitPresentationSize on ImageSharpFluid {
    maxHeight: presentationHeight
    maxWidth: presentationWidth
  }
`

/**
 * Traced SVG fluid images
 * @type {Fragment}
 */
export const GatsbyImageSharpFluid_tracedSVG = graphql`
  fragment GatsbyImageSharpFluid_tracedSVG on ImageSharpFluid {
    tracedSVG
    aspectRatio
    src
    srcSet
    sizes
  }
`

/**
 * Fluid images that prefer Webp
 * @type {Fragment}
 */
export const GatsbyImageSharpFluid_withWebp = graphql`
  fragment GatsbyImageSharpFluid_withWebp on ImageSharpFluid {
    base64
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`

/**
 * Traced SVG fluid images that prefer Webp
 * @type {Fragment}
 */
export const GatsbyImageSharpFluid_withWebp_tracedSVG = graphql`
  fragment GatsbyImageSharpFluid_withWebp_tracedSVG on ImageSharpFluid {
    tracedSVG
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`

/**
 * Traced SVG fluid images without the blurred base64 image
 * @type {Fragment}
 */
export const GatsbyImageSharpFluid_noBase64 = graphql`
  fragment GatsbyImageSharpFluid_noBase64 on ImageSharpFluid {
    aspectRatio
    src
    srcSet
    sizes
  }
`

/**
 * Traced SVG fluid images without the blurred base64 image that prefer Webp
 * @type {Fragment}
 */
export const GatsbyImageSharpFluid_withWebp_noBase64 = graphql`
  fragment GatsbyImageSharpFluid_withWebp_noBase64 on ImageSharpFluid {
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`
