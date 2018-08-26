import React, { Component } from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import Helmet from "react-helmet"
import typography, { rhythm, scale } from "../utils/typography"
import Img from "gatsby-image"

//A variant of the Creators Header Design here with Breadcrumb of Creators > PEOPLE (Whatever) > Creator so clickable to go back to creators

class CreatorTemplate extends Component {
  render() {
    const { data } = this.props
    const creator = data.creatorsYaml
    return (
      <Layout location={location}>
        <Helmet>
          <title>{creator.name}</title>
        </Helmet>
        <main
          role="main"
          css={{
            padding: rhythm(3 / 4),
          }}
        >
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
        </main>
      </Layout>
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
