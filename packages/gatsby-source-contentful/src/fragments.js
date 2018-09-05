import { graphql } from "gatsby"

export const contentfulAssetFixed = graphql`
  fragment GatsbyContentfulFixed on ContentfulFixed {
    base64
    width
    height
    src
    srcSet
  }
`

export const contentfulAssetFixedTracedSVG = graphql`
  fragment GatsbyContentfulFixed_tracedSVG on ContentfulFixed {
    tracedSVG
    width
    height
    src
    srcSet
  }
`

export const contentfulAssetFixedNoBase64 = graphql`
  fragment GatsbyContentfulFixed_noBase64 on ContentfulFixed {
    width
    height
    src
    srcSet
  }
`

export const contentfulAssetFixedPreferWebp = graphql`
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

export const contentfulAssetFixedPreferWebpNoBase64 = graphql`
  fragment GatsbyContentfulFixed_withWebp_noBase64 on ContentfulFixed {
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

export const contentfulAssetFluid = graphql`
  fragment GatsbyContentfulFluid on ContentfulFluid {
    base64
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const contentfulAssetFluidTracedSVG = graphql`
  fragment GatsbyContentfulFluid_tracedSVG on ContentfulFluid {
    tracedSVG
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const contentfulAssetFluidNoBase64 = graphql`
  fragment GatsbyContentfulFluid_noBase64 on ContentfulFluid {
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const contentfulAssetFluidPreferWebp = graphql`
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
export const contentfulAssetResolutions = graphql`
  fragment GatsbyContentfulResolutions on ContentfulResolutions {
    base64
    width
    height
    src
    srcSet
  }
`

export const contentfulAssetResolutionsTracedSVG = graphql`
  fragment GatsbyContentfulResolutions_tracedSVG on ContentfulResolutions {
    tracedSVG
    width
    height
    src
    srcSet
  }
`

export const contentfulAssetResolutionsNoBase64 = graphql`
  fragment GatsbyContentfulResolutions_noBase64 on ContentfulResolutions {
    width
    height
    src
    srcSet
  }
`

export const contentfulAssetResolutionsPreferWebp = graphql`
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

export const contentfulAssetResolutionsPreferWebpNoBase64 = graphql`
  fragment GatsbyContentfulResolutions_withWebp_noBase64 on ContentfulResolutions {
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

export const contentfulAssetSizes = graphql`
  fragment GatsbyContentfulSizes on ContentfulSizes {
    base64
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const contentfulAssetSizesTracedSVG = graphql`
  fragment GatsbyContentfulSizes_tracedSVG on ContentfulSizes {
    tracedSVG
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const contentfulAssetSizesNoBase64 = graphql`
  fragment GatsbyContentfulSizes_noBase64 on ContentfulSizes {
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const contentfulAssetSizesPreferWebp = graphql`
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

export const contentfulAssetSizesPreferWebpNoBase64 = graphql`
  fragment GatsbyContentfulSizes_withWebp_noBase64 on ContentfulSizes {
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`
