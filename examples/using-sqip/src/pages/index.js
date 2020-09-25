import * as React from "react"
import PropTypes from "prop-types"
import { graphql } from "gatsby"

import Layout from "../components/layout.js"

const IndexPage = ({ data }) => (
  <Layout data={data}>
    <h1>Gatsby SQIP Example</h1>
    <blockquote>
      <p>
        SQIP - pronounced \skwɪb\ like the non-magical folk of magical descent
      </p>
    </blockquote>
    <p>It is a svg based implementation of low quality image previews (LQIP)</p>
    <p>
      <strong>More precisely:</strong>
      <br /> An algorithm calculates a primitive representation of your images
      based on simple shapes like circles, ellipses, triangles and more. These
      will be embedded in your initial HTML payload. This will help your users
      to get a feeling of how the pictures will look like, even
      {` `}
      <strong>before</strong> they got loaded by their (probably) slow
      connection.
    </p>
    <h2>Configuration</h2>
    <p>
      For an up to date list of possible configuration options, please check out
      the
      {` `}
      <a href="https://www.gatsbyjs.com/plugins/gatsby-transformer-sqip/">
        plugins readme
      </a>
      .
    </p>
    <h3>Configuration and file size recommendations:</h3>
    <p>
      The maximum size of your previews really depend on your current html
      payload size and your personal limits
    </p>
    <ul>
      <li>Smaller thumbnails should range between 500-1000byte</li>
      <li>A single header image or a full sized hero might take 1-10kb</li>
      <li>
        For frequent previews like article teasers or image gallery thumbnails
        I’d recommend 15-25 shapes
      </li>
      <li>For header and hero images you may go up to 50-200 shapes</li>
    </ul>
    <p>
      Generally: <strong>Keep it as small as possible</strong> and test the
      impact of your image previews via
      {` `}
      <a href="https://www.webpagetest.org/">webpagetest.org</a> on a 3G
      connection.
    </p>
    <h2>Usage</h2>
    <p>Getting the data via GraphQL:</p>
    <pre>
      <code>{`image {
    sqip(numberOfPrimitives: 12, blur: 12, width: 256, height: 256),
    sizes(maxWidth: 400, maxHeight: 400) {
    ...GatsbyImageSharpSizes_noBase64
    }
  }`}</code>
    </pre>
    <p>
      <strong>Hint:</strong> Make sure to set the same aspect ratio for sqip and
      sizes/resolutions. For performance and quality, 256px width is a good base
      value for SQIP
    </p>

    <h3>Pure JSX/HTML</h3>
    <pre>
      <code>{`<div className="image-wrapper">
  <img src={image.dataURI} alt="" role="presentation" />
  <img src={image.src} alt="Useful description" className="image" />
</div>`}</code>
    </pre>
    <pre>
      <code>{`.image-wrapper {
  position: relative;
  overflow: hidden;
}
.image-wrapper img {
  display: block;
}

.image-wrapper img.image {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: auto;
  z-index: 1;
}`}</code>
    </pre>

    <h4>Pros:</h4>
    <ul>
      <li>No client-side JavaScript required</li>
      <li>
        Browser cache ensures previews are not shown when a user visits the page
        a second time
      </li>
    </ul>

    <h4>Cons:</h4>
    <ul>
      <li>
        All images are loaded, no matter if they are in the viewport or not
      </li>
    </ul>

    <h3>Gatsby Image</h3>
    <pre>
      <code>{`const Img = require(\`gatsby-image\`)

<Img
  resolutions={{
    ...image.resolutions,
    base64: image.sqip
  }}
/>

// or

<Img
  sizes={{
    ...image.sizes,
    base64: image.sqip
  }}
/>`}</code>
    </pre>
    <h4>Pros:</h4>
    <ul>
      <li>Nice fade-in effect</li>
      <li>Only images within the viewport are loaded</li>
    </ul>
    <h4>Cons:</h4>
    <ul>
      <li>Requires client-side JavaScript</li>
      <li>
        Images fade in all the time, even when the image is already in the
        browser cache
      </li>
    </ul>

    <h2>Copyright notice</h2>
    <p>
      The used images belong to their photographer, get more details by clicking
      on them. The background image was taken by
      {` `}
      <a href="https://unsplash.com/photos/ljHAKAnYs4I">Neven Krcmarek</a>.
    </p>
  </Layout>
)

export default IndexPage

IndexPage.propTypes = {
  data: PropTypes.object,
}

export const query = graphql`
  query {
    images: allFile(
      filter: { sourceInstanceName: { eq: "images" }, ext: { eq: ".jpg" } }
    ) {
      edges {
        node {
          publicURL
          name
          childImageSharp {
            fluid(maxWidth: 400, maxHeight: 400) {
              ...GatsbyImageSharpFluid_noBase64
            }
            sqip(
              # Make sure to keep the same aspect ratio when cropping
              # With 256px as maximum dimension is the perfect value to speed up the process
              width: 256
              height: 256
              numberOfPrimitives: 15
              blur: 8
              mode: 1
            ) {
              dataURI
            }
          }
        }
      }
    }
    background: allFile(
      filter: { sourceInstanceName: { eq: "background" }, ext: { eq: ".jpg" } }
    ) {
      edges {
        node {
          publicURL
          name
          childImageSharp {
            fluid(maxWidth: 4000) {
              ...GatsbyImageSharpFluid_noBase64
            }
            sqip(numberOfPrimitives: 160, blur: 0) {
              dataURI
            }
          }
        }
      }
    }
  }
`
