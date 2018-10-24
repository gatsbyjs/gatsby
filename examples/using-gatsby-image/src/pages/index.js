import React from "react"
import { graphql } from "gatsby"
import { FaGithub } from "react-icons/fa"
import Layout from "../layouts"

import { scale } from "../utils/typography"

class IndexComponent extends React.Component {
  render() {
    return (
      <Layout
        location={this.props.location}
        image={this.props.data.file.childImageSharp.fluid}
      >
        <p css={{ ...scale(6 / 9), marginBottom: 60 }}>
          <a href="https://www.gatsbyjs.org/packages/gatsby-image/">
            gatsby-image
          </a>
          {` `}
          is the official Image component for use in building Gatsby websites.
          It provides the fastest, most optimized image loading performance
          possible for Gatsby (and other React) websites.
        </p>
        <p>
          The component requires
          {` `}
          <em css={{ fontWeight: `bold`, fontStyle: `normal` }}>
            no configuration
          </em>
          {` `}
          when used within Gatsby. All image processing is done within Gatsby
          and official plugins.
        </p>
        <p>
          See the
          {` `}
          <a href="https://www.gatsbyjs.org/packages/gatsby-image/">
            component's documentation
          </a>
          {` `}
          as well as
          {` `}
          <a href="https://github.com/gatsbyjs/gatsby/blob/master/examples/using-gatsby-image/">
            <FaGithub
              css={{
                position: `relative`,
                bottom: `-0.125em`,
                backgroundImage: `none`,
              }}
            />
            {` `}
            view this site's source
          </a>
          {` `}
          to learn how to start using gatsby-image on your Gatsby sites.
        </p>
        <h2>Out of the box it:</h2>
        <ul className="list-success">
          <li>
            Loads the optimal size of image for each device size and screen
            resolution
          </li>
          <li>
            Holds the image position while loading so your page doesn't jump
            around as images load
          </li>
          <li>
            Uses the "blur-up" effect i.e. it loads a tiny version of the image
            to show while the full image is loading
          </li>
          <li>
            Alternatively provides a "traced placeholder" SVG of the image.
          </li>
          <li>
            Lazy loads images which reduces bandwidth and speeds the initial
            load time
          </li>
          <li>Uses WebP images if browser supports the format</li>
        </ul>
      </Layout>
    )
  }
}

export default IndexComponent

export const query = graphql`
  query {
    file(
      relativePath: { regex: "/alexander-andrews-260988-unsplash_edited.jpg/" }
    ) {
      childImageSharp {
        fluid(
          maxWidth: 1000
          quality: 80
          duotone: { highlight: "#ffffff", shadow: "#663399" }
        ) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`
