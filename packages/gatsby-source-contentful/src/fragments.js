/* eslint-disable */
export const contentfulAssetResolutions = graphql`
  fragment GatsbyContentfulResolutions on ContentfulResolutions {
    base64
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
