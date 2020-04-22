import { graphql } from "gatsby"

/**
 * The simplest set of fields for fixed assets
 * @type {Fragment}
 * @example
 * myContentfulAssetField {
 *   fixed {
 *     ...GatsbyContentfulFixed
 *     # ^ identical to using the following fields:
 *     # base64
 *     # width
 *     # height
 *     # src
 *     # srcSet
 *   }
 * }
 */
export const GatsbyContentfulFixed = graphql`
  fragment GatsbyContentfulFixed on ContentfulFixed {
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
export const GatsbyContentfulFixed_tracedSVG = graphql`
  fragment GatsbyContentfulFixed_tracedSVG on ContentfulFixed {
    tracedSVG
    width
    height
    src
    srcSet
  }
`

/**
 * Assets without the blurred base64 imate
 * @type {Fragment}
 */
export const GatsbyContentfulFixed_noBase64 = graphql`
  fragment GatsbyContentfulFixed_noBase64 on ContentfulFixed {
    width
    height
    src
    srcSet
  }
`

/**
 * Fixed assets that prefer Webp
 * @type {Fragment}
 */
export const GatsbyContentfulFixed_withWebp = graphql`
  fragment GatsbyContentfulFixed_withWebp on ContentfulFixed {
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
 * Traced SVG fixed assets without the blurred base64 image that prefer Webp
 * @type {Fragment}
 */
export const GatsbyContentfulFixed_withWebp_noBase64 = graphql`
  fragment GatsbyContentfulFixed_withWebp_noBase64 on ContentfulFixed {
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

/**
 * The simplest set of fields for fluid assets
 * @type {Fragment}
 */
export const GatsbyContentfulFluid = graphql`
  fragment GatsbyContentfulFluid on ContentfulFluid {
    base64
    aspectRatio
    src
    srcSet
    sizes
  }
`

/**
 * Traced SVG fluid assets
 * @type {Fragment}
 */
export const GatsbyContentfulFluid_tracedSVG = graphql`
  fragment GatsbyContentfulFluid_tracedSVG on ContentfulFluid {
    tracedSVG
    aspectRatio
    src
    srcSet
    sizes
  }
`

/**
 * Traced SVG fluid assets without the blurred base64 image
 * @type {Fragment}
 */
export const GatsbyContentfulFluid_noBase64 = graphql`
  fragment GatsbyContentfulFluid_noBase64 on ContentfulFluid {
    aspectRatio
    src
    srcSet
    sizes
  }
`

/**
 * Fluid assets that prefer Webp
 * @type {Fragment}
 */
export const GatsbyContentfulFluid_withWebp = graphql`
  fragment GatsbyContentfulFluid_withWebp on ContentfulFluid {
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
 * Traced SVG fluid assets without the blurred base64 image that prefer Webp
 * @type {Fragment}
 */
export const contentfulAssetFluidPreferWebpNoBase64 = graphql`
  fragment GatsbyContentfulFluid_withWebp_noBase64 on ContentfulFluid {
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`

// TODO: in v3 remove these legacy fragments
export const GatsbyContentfulResolutions = graphql`
  fragment GatsbyContentfulResolutions on ContentfulResolutions {
    base64
    width
    height
    src
    srcSet
  }
`

export const GatsbyContentfulResolutions_tracedSVG = graphql`
  fragment GatsbyContentfulResolutions_tracedSVG on ContentfulResolutions {
    tracedSVG
    width
    height
    src
    srcSet
  }
`

export const GatsbyContentfulResolutions_noBase64 = graphql`
  fragment GatsbyContentfulResolutions_noBase64 on ContentfulResolutions {
    width
    height
    src
    srcSet
  }
`

export const GatsbyContentfulResolutions_withWebp = graphql`
  fragment GatsbyContentfulResolutions_withWebp on ContentfulResolutions {
    base64
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

export const GatsbyContentfulResolutions_withWebp_noBase64 = graphql`
  fragment GatsbyContentfulResolutions_withWebp_noBase64 on ContentfulResolutions {
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

export const GatsbyContentfulSizes = graphql`
  fragment GatsbyContentfulSizes on ContentfulSizes {
    base64
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const GatsbyContentfulSizes_tracedSVG = graphql`
  fragment GatsbyContentfulSizes_tracedSVG on ContentfulSizes {
    tracedSVG
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const GatsbyContentfulSizes_noBase64 = graphql`
  fragment GatsbyContentfulSizes_noBase64 on ContentfulSizes {
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const GatsbyContentfulSizes_withWebp = graphql`
  fragment GatsbyContentfulSizes_withWebp on ContentfulSizes {
    base64
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`

export const GatsbyContentfulSizes_withWebp_noBase64 = graphql`
  fragment GatsbyContentfulSizes_withWebp_noBase64 on ContentfulSizes {
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`
