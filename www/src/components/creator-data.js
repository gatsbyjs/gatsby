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
        fixed(width: 240, height: 240) {
          ...GatsbyImageSharpFixed
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
