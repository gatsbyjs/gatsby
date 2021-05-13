import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

import Layout from "../layouts"
import { rhythm } from "../utils/typography"

const ImageAPI = props => {
  const assets = props.data.allContentfulAsset.edges
  return (
    <Layout>
      <div
        style={{
          margin: `0 auto`,
          marginTop: rhythm(1.5),
          marginBottom: rhythm(1.5),
          maxWidth: 650,
          paddingLeft: rhythm(3 / 4),
          paddingRight: rhythm(3 / 4),
        }}
      >
        <h1>Image API examples</h1>
        <p>
          Gatsby offers rich integration with
          {` `}
          <a href="https://www.contentful.com/developers/docs/references/images-api/">
            {`Contentful's Image API`}
          </a>
        </p>
        <p>
          Images can be display with three different layouts. Learn more about
          them in the{` `}
          <a href="https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/#layout">
            reference of gatsby-plugin-image
          </a>
        </p>
        <ul>
          <li>
            <a href="#constrained">Constrained</a>
          </li>
          <li>
            <a href="#fixed">Fixed</a>
          </li>
          <li>
            <a href="#full-width">Full width</a>
          </li>
        </ul>
        <p>
          All placeholder variants are supported as well. See more at the
          <a href="https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/#placeholder">
            reference of gatsby-plugin-image
          </a>
        </p>
        <ul>
          <li>
            <a href="#blurred">Blurred</a>
          </li>
          <li>
            <a href="#traced">Traced SVG</a>
          </li>
        </ul>
        <h2 id="traced">Constrained</h2>
        <p>
          This is the default layout. It displays the image at the size of the
          source image, or you can set a maximum size by passing in{` `}
          <strong>width</strong> or
          <strong>height</strong>). If the screen or container size is less than
          the width of the image, it scales down to fit, maintaining its aspect
          ratio. It generates smaller versions of the image so that a mobile
          browser doesn’t need to load the full-size image.
        </p>
        <div
          style={{
            display: `grid`,
            gridTemplateColumns: `repeat(3, minmax(0, 1fr))`,
            gap: rhythm(1),
          }}
        >
          {assets.map(({ node: { id, title, constrained } }) => (
            <div key={id}>
              <GatsbyImage
                image={constrained}
                alt={title}
                style={{ border: `1px solid red` }}
              />
            </div>
          ))}
        </div>
        <h4>GraphQL query</h4>
        <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
          <code
            dangerouslySetInnerHTML={{
              __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        gatsbyImageData(layout: CONSTRAINED, width: 186)
      }
    }
  }
}`,
            }}
          />
        </pre>

        <h2 id="fixed">Fixed</h2>
        <p>
          This is a fixed-size image. It will always display at the same size,
          and will not shrink to fit its container. This is either the size of
          the source image, or the size set by the width and height props. Only
          use this if you are certain that the container will never need to be
          narrower than the image.
        </p>
        {assets.map(({ node: { id, title, fixed } }) => (
          <GatsbyImage
            key={id}
            alt={title}
            image={fixed}
            style={{
              marginRight: rhythm(1 / 2),
              marginBottom: rhythm(1 / 2),
              border: `1px solid tomato`,
              display: `inline-block`,
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
        gatsbyImageData(layout: FIXED, width: 100, height: 100)
      }
    }
  }
}`,
            }}
          />
        </pre>

        <h2 id="full-width">Full width</h2>
        <p>
          Use this for images that are always displayed at the full width of the
          screen, such as banners or hero images. Like the constrained layout,
          this resizes to fit the container. However it is not restricted to a
          maximum size, so will grow to fill the container however large it is,
          maintaining its aspect ratio. It generates several smaller image sizes
          for different screen breakpoints, so that the browser only needs to
          load one large enough to fit the screen. You can pass a breakpoints
          prop if you want to specify the sizes to use, though in most cases you
          can allow it to use the default.
        </p>
      </div>
      <GatsbyImage
        key={assets[1].node.id}
        alt={assets[1].node.title}
        image={assets[1].node.fullWidth}
        style={{}}
      />
      <h4>GraphQL query</h4>
      <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
        <code
          dangerouslySetInnerHTML={{
            __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        gatsbyImageData(layout: FULL_WIDTH)
      }
    }
  }
}`,
          }}
        />
      </pre>
      <h2 id="dominant">Dominant color previews</h2>
      <p>
        This calculates the dominant color of the source image and uses it as a
        solid background color.
      </p>
      <div
        style={{
          display: `grid`,
          gridTemplateColumns: `repeat(3, minmax(0, 1fr))`,
          gap: rhythm(1),
        }}
      >
        {assets.map(({ node: { id, title, dominant } }) => (
          <div key={id}>
            <GatsbyImage
              image={dominant}
              alt={title}
              style={{ border: `1px solid red` }}
            />
          </div>
        ))}
      </div>
      <h4>GraphQL query</h4>
      <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
        <code
          dangerouslySetInnerHTML={{
            __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        gatsbyImageData(
          layout: CONSTRAINED
          placeholder: DOMINANT_COLOR
          width: 186
        )
      }
    }
  }
}`,
          }}
        />
      </pre>
      <h2 id="blurred">Blurred previews</h2>
      <p>
        This generates a very low-resolution version of the source image and
        displays it as a blurred background.
      </p>
      <div
        style={{
          display: `grid`,
          gridTemplateColumns: `repeat(3, minmax(0, 1fr))`,
          gap: rhythm(1),
        }}
      >
        {assets.map(({ node: { id, title, blurred } }) => (
          <div key={id}>
            <GatsbyImage
              image={blurred}
              alt={title}
              style={{ border: `1px solid red` }}
            />
          </div>
        ))}
      </div>
      <h4>GraphQL query</h4>
      <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
        <code
          dangerouslySetInnerHTML={{
            __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        gatsbyImageData(
          layout: CONSTRAINED
          placeholder: BLURRED
          width: 186
        )
      }
    }
  }
}`,
          }}
        />
      </pre>
      <h2 id="traced">Traced SVG previews</h2>
      <p>
        This generates a simplified, flat SVG version of the source image, which
        it displays as a placeholder. This works well for images with simple
        shapes or that include transparency.
      </p>
      <div
        style={{
          display: `grid`,
          gridTemplateColumns: `repeat(3, minmax(0, 1fr))`,
          gap: rhythm(1),
        }}
      >
        {assets.map(({ node: { id, title, traced } }) => (
          <div key={id}>
            <GatsbyImage
              image={traced}
              alt={title}
              style={{ border: `1px solid red` }}
            />
          </div>
        ))}
      </div>
      <h4>GraphQL query</h4>
      <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
        <code
          dangerouslySetInnerHTML={{
            __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        gatsbyImageData(
          layout: CONSTRAINED
          placeholder: TRACED_SVG
          width: 186
        )
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
          id
          constrained: gatsbyImageData(layout: CONSTRAINED, width: 186)
          fixed: gatsbyImageData(layout: FIXED, width: 100, height: 100)
          fullWidth: gatsbyImageData(layout: FULL_WIDTH)
          dominant: gatsbyImageData(
            layout: CONSTRAINED
            placeholder: DOMINANT_COLOR
            width: 186
          )
          blurred: gatsbyImageData(
            layout: CONSTRAINED
            placeholder: BLURRED
            width: 186
          )
          traced: gatsbyImageData(
            layout: CONSTRAINED
            placeholder: TRACED_SVG
            width: 186
          )
        }
      }
    }
  }
`
