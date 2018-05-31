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

export const contentfulAssetFluid = graphql`
  fragment GatsbyContentfulFluid on ContentfulFluid {
    base64
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
