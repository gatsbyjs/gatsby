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
export const FixedImage = graphql`
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
export const FixedTracedSVGImage = graphql`
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
export const FixedWebpImage = graphql`
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
export const FixedTracedSVGWebpImage = graphql`
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
export const gatsbyImageSharpFixedNoBase64 = graphql`
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
export const gatsbyImageSharpFixedPreferWebpNoBase64 = graphql`
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
export const gatsbyImageSharpFluid = graphql`
  fragment GatsbyImageSharpFluid on ImageSharpFluid {
    base64
    aspectRatio
    src
    srcSet
    sizes
  }
`

/**
 * Traced SVG fluid images
 * @type {Fragment}
 */
export const gatsbyImageSharpFluidTracedSVG = graphql`
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
export const gatsbyImageSharpFluidPreferWebp = graphql`
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
export const gatsbyImageSharpFluidPreferWebpTracedSVG = graphql`
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
export const gatsbyImageSharpFluidNoBase64 = graphql`
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
export const gatsbyImageSharpFluidPreferWebpNoBase64 = graphql`
  fragment GatsbyImageSharpFluid_withWebp_noBase64 on ImageSharpFluid {
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`

// TODO: in v3 remove these legacy fragments
export const gatsbyImageSharpResolutions = graphql`
  fragment GatsbyImageSharpResolutions on ImageSharpResolutions {
    base64
    width
    height
    src
    srcSet
  }
`

export const gatsbyImageSharpResolutionsTracedSVG = graphql`
  fragment GatsbyImageSharpResolutions_tracedSVG on ImageSharpResolutions {
    tracedSVG
    width
    height
    src
    srcSet
  }
`

export const gatsbyImageSharpResolutionsPreferWebp = graphql`
  fragment GatsbyImageSharpResolutions_withWebp on ImageSharpResolutions {
    base64
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

export const gatsbyImageSharpResolutionsPreferWebpTracedSVG = graphql`
  fragment GatsbyImageSharpResolutions_withWebp_tracedSVG on ImageSharpResolutions {
    tracedSVG
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

export const gatsbyImageSharpResolutionsNoBase64 = graphql`
  fragment GatsbyImageSharpResolutions_noBase64 on ImageSharpResolutions {
    width
    height
    src
    srcSet
  }
`

export const gatsbyImageSharpResolutionsPreferWebpNoBase64 = graphql`
  fragment GatsbyImageSharpResolutions_withWebp_noBase64 on ImageSharpResolutions {
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

export const gatsbyImageSharpSizes = graphql`
  fragment GatsbyImageSharpSizes on ImageSharpSizes {
    base64
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const gatsbyImageSharpSizesTracedSVG = graphql`
  fragment GatsbyImageSharpSizes_tracedSVG on ImageSharpSizes {
    tracedSVG
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const gatsbyImageSharpSizesPreferWebp = graphql`
  fragment GatsbyImageSharpSizes_withWebp on ImageSharpSizes {
    base64
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`

export const gatsbyImageSharpSizesPreferWebpTracedSVG = graphql`
  fragment GatsbyImageSharpSizes_withWebp_tracedSVG on ImageSharpSizes {
    tracedSVG
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`

export const gatsbyImageSharpSizesNoBase64 = graphql`
  fragment GatsbyImageSharpSizes_noBase64 on ImageSharpSizes {
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const gatsbyImageSharpSizesPreferWebpNoBase64 = graphql`
  fragment GatsbyImageSharpSizes_withWebp_noBase64 on ImageSharpSizes {
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`
