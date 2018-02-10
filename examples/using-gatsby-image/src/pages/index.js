import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"
import Navigation from "../components/navigation"

import { rhythm, options } from "../utils/typography"

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
            padding: rhythm(4 / 3),
            "@media screen and (min-width: 640px)": {
              padding: rhythm(5 / 3),
            },
            borderRadius: rhythm(1 / 4),
            marginTop: `30vh`,
            position: `relative`,
          }}
        >
          <div
            css={{
              paddingBottom: rhythm(options.blockMarginBottom * 2),
            }}
          >
            <Navigation />
          </div>
          {` `}
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
            The component requires{` `}
            <em css={{ fontWeight: `bold`, fontStyle: `normal` }}>
              no configuration
            </em>
            {` `}
            when used within Gatsby. All image processing is done within Gatsby
            and official plugins.
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
            <li>
              <Link to="/prefer-webp/">Prefer WebP</Link>
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
            <li>Uses WebP images if browser supports the format</li>
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
    imageSharp(id: { regex: "/ng-55646/" }) {
      sizes(maxWidth: 1500, rotate: 180) {
        ...GatsbyImageSharpSizes
      }
    }
  }
`
