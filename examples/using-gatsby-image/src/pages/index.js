import React from "react"
import Link from "gatsby-link"
import Img from "gatsby-image"

import { rhythm } from "../utils/typography"

class IndexComponent extends React.Component {
  render() {
    return (
      <div>
        <Img
          css={{ top: 0, left: 0, right: 0, zIndex: -1 }}
          style={{ position: `absolute` }}
          sizes={this.props.data.imageSharp.sizes}
        />
        <div
          css={{
            background: `white`,
            zIndex: 1,
            padding: rhythm(2),
            borderRadius: rhythm(1 / 2),
            marginTop: rhythm(3),
            position: `relative`,
          }}
        >
          <h1 css={{ marginTop: 0 }}>Gatsby Image</h1>
          <p>
            <a href="https://www.gatsbyjs.org/packages/gatsby-image/">
              gatsby-image
            </a>
            {` `}
            is the official Image component for use in building Gatsby websites.
            It provides the fastest, most optimized image loading performance
            possible for Gatsby (and other React) websites.
          </p>
          <p>
            The component requires <em>no configuration</em> when used within
            Gatsby. All image processing is done within Gatsby and official
            plugins.
          </p>
          <p>
            <a href="https://www.gatsbyjs.org/packages/gatsby-image/">
              See the component's documentation
            </a>
            {` `}
            as well as
            {` `}
            <a href="https://github.com/gatsbyjs/gatsby/blob/master/examples/using-gatsby-image/">
              view this site's source
            </a>
            {` `}
            to learn how to start using gatsby-image on your Gatsby sites.
          </p>
          <h2>Demo pages</h2>
          <ul>
            <li>
              <Link to="/blur-up/">Blur Up</Link>
            </li>
            <li>
              <Link to="/background-color/">Background color</Link>
            </li>
            <li>
              <Link to="/traced-svg/">Traced SVG</Link>
            </li>
          </ul>
          <h2>Out of the box it:</h2>
          <ul>
            <li>
              Loads the optimal size of image for each device size and screen
              resolution
            </li>
            <li>
              Holds the image position while loading so your page doesn't jump
              around as images load
            </li>
            <li>
              Uses the "blur-up" effect i.e. it loads a tiny version of the
              image to show while the full image is loading
            </li>
            <li>
              Alternatively provides a "traced placeholder" SVG of the image.
            </li>
            <li>
              Lazy loads images which reduces bandwidth and speeds the initial
              load time
            </li>
          </ul>
          <h2>Documentation</h2>
          <p>
            <a href="https://www.gatsbyjs.org/packages/gatsby-image/">
              See the project README for documentation on using the plugin.
            </a>
          </p>
        </div>
      </div>
    )
  }
}

export default IndexComponent

export const query = graphql`
  query FrontPageQuery {
    imageSharp(id: { regex: "/nasa/" }) {
      sizes(maxWidth: 1500) {
        ...GatsbyImageSharpSizes
      }
    }
  }
`
