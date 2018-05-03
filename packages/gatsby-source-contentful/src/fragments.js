/* eslint-disable */
export const contentfulAssetFixed = graphql`
  fragment GatsbyContentfulFixed on ContentfulFixed {
    base64
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
