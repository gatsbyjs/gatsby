import React from "react"
import Img from "gatsby-image"
import { rhythm } from "../utils/typography"

export default props => {
  const assets = props.data.allContentfulAsset.edges
  return (
    <div>
      <h1>Image API examples</h1>
      <p>
        Gatsby offers rich integration with{` `}
        <a href="https://www.contentful.com/developers/docs/references/images-api/">
          Contentful's Image API
        </a>
      </p>
      <p>
        Open Graph<em>i</em>QL on your own site to experiment with the following
        options
      </p>
      <h2>Resize</h2>
      {assets.map(({ node: { title, resize } }) => (
        <img
          key={resize.src}
          alt={title}
          src={resize.src}
          width={resize.width}
          height={resize.height}
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: rhythm(1 / 2),
            border: `1px solid tomato`,
          }}
        />
      ))}
      <h4>GraphQL query</h4>
      <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
        <code
          dangerouslySetInnerHTML={{
            __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        resize(width: 100) {
          src
          width
          height
        }
      }
    }
  }
}`,
          }}
        />
      </pre>

      <h2>Responsive Resolution</h2>
      <p>
        If you make queries with <code>resolutions</code> then Gatsby
        automatically generates images with 1x, 1.5x, 2x, and 3x versions so
        your images look great on whatever screen resolution of device they're
        on.
      </p>
      <p>
        If you're on a retina class screen, notice how much sharper these images
        are than the above "resized" images.
      </p>
      <p>
        You should prefer this operator over <code>resize</code>.
      </p>
      {assets.map(({ node: { title, resolutions } }) => (
        <div key={resolutions.src} style={{ display: `inline-block` }}>
          <Img
            key={resolutions.src}
            alt={title}
            resolutions={resolutions}
            backgroundColor
            style={{
              marginRight: rhythm(1 / 2),
              marginBottom: rhythm(1 / 2),
              border: `1px solid tomato`,
              display: `inline-block`,
            }}
          />
        </div>
      ))}
      <h4>GraphQL query</h4>
      <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
        <code
          dangerouslySetInnerHTML={{
            __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        resolutions(width: 100) {
          width
          height
          src
          srcSet
        }
      }
    }
  }
}`,
          }}
        />
      </pre>

      <h2>Resizing</h2>
      <p>
        On both resize and resolutions you can also add a{` `}
        <code>height</code>
        {` `}
        argument to the GraphQL argument to crop the image to a certain size.
      </p>
      <p>
        You can also set the{` `}
        <a href="https://www.contentful.com/developers/docs/references/images-api/#/reference/resizing-&-cropping/change-the-resizing-behavior">
          resizing behavior
        </a>
        {` `}
        and{` `}
        <a href="https://www.contentful.com/developers/docs/references/images-api/#/reference/resizing-&-cropping/specify-focus-area-for-resizing">
          resizing focus area
        </a>
      </p>
      {assets.map(({ node: { title, resizing } }) => (
        <div key={resizing.src} style={{ display: `inline-block` }}>
          <Img
            alt={title}
            resolutions={resizing}
            style={{
              marginRight: rhythm(1 / 2),
              marginBottom: rhythm(1 / 2),
              border: `1px solid tomato`,
            }}
          />
        </div>
      ))}
      <h4>GraphQL query</h4>
      <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
        <code
          dangerouslySetInnerHTML={{
            __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        resolutions(width: 100, height: 100) {
          width
          height
          src
          srcSet
        }
      }
    }
  }
}`,
          }}
        />
      </pre>

      <h2>Responsive Sizes</h2>
      <p>
        This GraphQL option allows you to generate responsive images that
        automatically respond to different device screen resolution and widths.
        E.g. a smartphone browser will download a much smaller image than a
        desktop device.
      </p>
      <p>
        Instead of specifying a width and height, with sizes you specify a{` `}
        <code>maxWidth</code>, the max width the container of the images
        reaches.
      </p>
      {assets.map(({ node: { title, sizes } }) => (
        <Img
          key={sizes.src}
          alt={title}
          sizes={sizes}
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: rhythm(1 / 2),
            border: `1px solid tomato`,
          }}
        />
      ))}
      <h4>GraphQL query</h4>
      <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
        <code
          dangerouslySetInnerHTML={{
            __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        sizes(maxWidth: 613) {
          sizes
          src
          srcSet
        }
      }
    }
  }
}`,
          }}
        />
      </pre>
      <h2>WebP Images</h2>
      <p>
        WebP is an image format that provides lossy and lossless compression
        that may be better than JPEG or PNG. The <code>srcWebp</code> and{` `}
        <code>srcSetWebp</code> fields are available for{` `}
        <code>resolutions</code> and <code>sizes</code> queries.
      </p>
      <p>
        WebP is currently only supported in{` `}
        <a href="https://caniuse.com/#feat=webp">Chrome and Oprah browsers</a>,
        and you'll want to fall back to another format for other clients. When
        this query is used with{` `}
        <a href="https://www.gatsbyjs.org/packages/gatsby-image/">
          <code>gatsby-image</code>
        </a>
        {` `}
        WebP will be used automatically in browsers that support it.
      </p>
      {assets.map(({ node: { title, webp } }) => (
        <div key={webp.src} style={{ display: `inline-block` }}>
          <Img
            key={webp.src}
            alt={title}
            resolutions={webp}
            style={{
              marginRight: rhythm(1 / 2),
              marginBottom: rhythm(1 / 2),
              border: `1px solid tomato`,
            }}
          />
        </div>
      ))}
      <h4>GraphQL query</h4>
      <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
        <code
          dangerouslySetInnerHTML={{
            __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        resolutions(width: 100) {
          width
          height
          src
          srcSet
          srcWebp
          srcSetWebp
        }
      }
    }
  }
}`,
          }}
        />
      </pre>
    </div>
  )
}

export const pageQuery = graphql`
  query ImageAPIExamples {
    allContentfulAsset(filter: { node_locale: { eq: "en-US" } }) {
      edges {
        node {
          title
          resize(width: 100) {
            src
            width
            height
          }
          resolutions(width: 100) {
            ...GatsbyContentfulResolutions_noBase64
          }
          resizing: resolutions(width: 100, height: 100) {
            ...GatsbyContentfulResolutions_noBase64
          }
          webp: resolutions(width: 100) {
            ...GatsbyContentfulResolutions_withWebp_noBase64
          }
          sizes(maxWidth: 613) {
            ...GatsbyContentfulSizes_noBase64
          }
        }
      }
    }
  }
`
