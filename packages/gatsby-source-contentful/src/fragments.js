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
