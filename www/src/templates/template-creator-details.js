import React, { Component } from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

class CreatorTemplate extends Component {
  render() {
    const { data } = this.props
    const creator = data.creatorsYaml
    return (
      <div
        css={{
          display: `flex`,
        }}
      >
        <Img
          css={{
            minWidth: `30vw`,
          }}
          alt={`${creator.name}`}
          fluid={creator.image.childImageSharp.fluid}
        />
        <p>{creator.name}</p>
        <p>{creator.location}</p>
      </div>
    )
  }
}

export default CreatorTemplate

export const pageQuery = graphql`
  query($slug: String!) {
    creatorsYaml(fields: { slug: { eq: $slug } }) {
      name
      description
      location
      website
      github
      image {
        childImageSharp {
          fluid {
            ...GatsbyImageSharpFluid
          }
        }
      }
      portfolio
      fields {
        slug
      }
    }
  }
`
