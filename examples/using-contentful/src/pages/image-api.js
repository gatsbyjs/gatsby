import React from "react"
import { rhythm } from "../utils/typography"

export default props => {
  console.log(props)
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
      {assets.map(({ node: { title, resize } }) => {
        console.log(title, resize)
        return (
          <img
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
        )
      })}
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
          aspectRatio
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
        If you make queries with <code>responsiveResolution</code> then Gatsby
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
      {assets.map(({ node: { title, responsiveResolution } }) => {
        console.log(title, responsiveResolution)
        return (
          <img
            alt={title}
            src={responsiveResolution.src}
            srcSet={responsiveResolution.srcSet}
            width={responsiveResolution.width}
            height={responsiveResolution.height}
            style={{
              marginRight: rhythm(1 / 2),
              marginBottom: rhythm(1 / 2),
              border: `1px solid tomato`,
            }}
          />
        )
      })}
      <h4>GraphQL query</h4>
      <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
        <code
          dangerouslySetInnerHTML={{
            __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        responsiveResolution(width: 100) {
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
        On both resize and responsiveResolution you can also add a{` `}
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
      {assets.map(({ node: { title, resizing } }) => {
        console.log(title, resizing)
        return (
          <img
            alt={title}
            src={resizing.src}
            srcSet={resizing.srcSet}
            width={resizing.width}
            height={resizing.height}
            style={{
              marginRight: rhythm(1 / 2),
              marginBottom: rhythm(1 / 2),
              border: `1px solid tomato`,
            }}
          />
        )
      })}
      <h4>GraphQL query</h4>
      <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
        <code
          dangerouslySetInnerHTML={{
            __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        responsiveResolution(width: 100, height: 100) {
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
        Instead of specifying a width and height, with responsiveSizes you
        specify a <code>maxWidth</code>, the max width the container of the
        images reaches.
      </p>
      {assets.map(({ node: { title, responsiveSizes } }) =>
        <img
          alt={title}
          src={responsiveSizes.src}
          srcSet={responsiveSizes.srcSet}
          sizes={responsiveSizes.sizes}
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: rhythm(1 / 2),
            border: `1px solid tomato`,
          }}
        />
      )}
      <h4>GraphQL query</h4>
      <pre style={{ background: `#efeded`, padding: rhythm(3 / 4) }}>
        <code
          dangerouslySetInnerHTML={{
            __html: `{
  allContentfulAsset {
    edges {
      node {
        title
        responsiveSizes(maxWidth: 613) {
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
    </div>
  )
}

export const pageQuery = graphql`
  query ImageAPIExamples {
    allContentfulAsset {
      edges {
        node {
          title
          resize(width: 100) {
            src
            width
            height
            aspectRatio
          }
          responsiveResolution(width: 100) {
            width
            height
            src
            srcSet
          }
          resizing: responsiveResolution(width: 100, height: 100) {
            width
            height
            src
            srcSet
          }
          responsiveSizes(maxWidth: 613) {
            sizes
            src
            srcSet
          }
        }
      }
    }
  }
`
