import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import Layout from "../layouts"
import { rhythm } from "../utils/typography"

const ImageAPI = props => {
  const assets = props.data.allContentfulAsset.edges
  return (
    <Layout>
      <h1>Image API examples</h1>
      <p>
        Gatsby offers rich integration with
        {` `}
        <a href="https://www.contentful.com/developers/docs/references/images-api/">
          {`Contentful's Image API`}
        </a>
      </p>
      <p>
        Open Graph
        <em>i</em>
        QL on your own site to experiment with the following options
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

      <h2>Fixed</h2>
      <p>
        If you make queries with <code>fixed</code> then Gatsby automatically
        generates images with 1x, 1.5x, 2x, and 3x versions so your images look
        great on whatever screen resolution of device {`they're`} on.
      </p>
      <p>
        If {`you're`} on a retina class screen, notice how much sharper these
        images are than the above {`"resized"`} images.
      </p>
      <p>
        You should prefer this operator over <code>resize</code>.
      </p>
      {assets.map(({ node: { title, fixed } }) => (
        <div key={fixed.src} style={{ display: `inline-block` }}>
          <Img
            key={fixed.src}
            alt={title}
            fixed={fixed}
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
        fixed(width: 100) {
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
        On both resize and fixed you can also add a{` `}
        <code>height</code>
        {` `}
        argument to the GraphQL argument to crop the image to a certain size.
      </p>
      <p>
        You can also set the
        {` `}
        <a href="https://www.contentful.com/developers/docs/references/images-api/#/reference/resizing-&-cropping/change-the-resizing-behavior">
          resizing behavior
        </a>
        {` `}
        and
        {` `}
        <a href="https://www.contentful.com/developers/docs/references/images-api/#/reference/resizing-&-cropping/specify-focus-area-for-resizing">
          resizing focus area
        </a>
      </p>
      {assets.map(({ node: { title, resizing } }) => (
        <div key={resizing.src} style={{ display: `inline-block` }}>
          <Img
            alt={title}
            fixed={resizing}
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
        fixed(width: 100, height: 100) {
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

      <h2>Fluid</h2>
      <p>
        This GraphQL option allows you to generate responsive images that
        automatically respond to different device screen resolution and widths.
        E.g. a smartphone browser will download a much smaller image than a
        desktop device.
      </p>
      <p>
        Instead of specifying a width and height, with <code>fluid</code> you
        specify a{` `}
        <code>maxWidth</code>, the max width the container of the images
        reaches.
      </p>
      {assets.map(({ node: { title, fluid } }) => (
        <Img
          key={fluid.src}
          alt={title}
          fluid={fluid}
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
        fluid(maxWidth: 613) {
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
        that may be better than JPEG or PNG. The <code>srcWebp</code> and
        {` `}
        <code>srcSetWebp</code> fields are available for
        {` `}
        <code>fixed</code> and <code>fluid</code> queries.
      </p>
      <p>
        WebP is currently only supported in
        {` `}
        <a href="https://caniuse.com/#feat=webp">Chrome and Oprah browsers</a>,
        and {`you'll`} want to fall back to another format for other clients.
        When this query is used with
        {` `}
        <a href="https://www.gatsbyjs.com/plugins/gatsby-image/">
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
            fixed={webp}
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
        fixed(width: 100) {
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
      <h2>Traced SVG previews</h2>
      <p>
        You can show a traced SVG preview to your users. This works equivalent
        to the responsive fluid feature except that you have to use the
        GatsbyContentfulFixed_tracedSVG fragment
      </p>
      {assets.map(({ node: { title, traced } }) => (
        <Img
          key={traced.src}
          alt={title}
          fluid={traced}
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
        fluid(maxWidth: 614) {
          ...GatsbyContentfulFluid_tracedSVG
        }
      }
    }
  }
}`,
          }}
        />
      </pre>
    </Layout>
  )
}

export default ImageAPI

export const pageQuery = graphql`
  query {
    allContentfulAsset(filter: { node_locale: { eq: "en-US" } }) {
      edges {
        node {
          title
          resize(width: 100) {
            src
            width
            height
          }
          fixed(width: 100) {
            ...GatsbyContentfulFixed_noBase64
          }
          resizing: fixed(width: 100, height: 100) {
            ...GatsbyContentfulFixed_noBase64
          }
          webp: fixed(width: 100) {
            ...GatsbyContentfulFixed_withWebp_noBase64
          }
          fluid(maxWidth: 613) {
            ...GatsbyContentfulFluid_noBase64
          }
          traced: fluid(maxWidth: 614) {
            ...GatsbyContentfulFluid_tracedSVG
          }
        }
      }
    }
  }
`
