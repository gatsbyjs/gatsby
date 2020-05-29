import { graphql } from "gatsby"

export const creatorDataFragment = graphql`
  fragment CreatorData on CreatorsYaml {
    name
    type
    description
    location
    website
    github
    image {
      childImageSharp {
        fluid(maxWidth: 240, maxHeight: 240) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    for_hire
    hiring
    portfolio
    fields {
      slug
    }
  }
`
