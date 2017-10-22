/* eslint-disable */
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

export const gatsbyImageSharpResolutionsNoBase64 = graphql`
  fragment GatsbyImageSharpResolutions_noBase64 on ImageSharpResolutions {
    width
    height
    src
    srcSet
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

export const gatsbyImageSharpSizesNoBase64 = graphql`
  fragment GatsbyImageSharpSizes_noBase64 on ImageSharpSizes {
    aspectRatio
    src
    srcSet
    sizes
  }
`
