import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import Layout from "../layouts"
import { rhythm } from "../utils/typography"

class Index extends React.Component {
  render() {
    const data = this.props.data
    const images = data.allImageSharp.edges
    const fluid = data.fluidImages.childImageSharp.fluid
    const fixed = data.fixedImages.childImageSharp.fixed
    const cropDefault = data.cropDefault.childImageSharp.resize
    const cropBottomLeft = data.cropBottomLeft.childImageSharp.resize
    const cropEntropy = data.cropEntropy.childImageSharp.resize
    const cropCenter = data.cropCenter.childImageSharp.resize
    const fluidDuotoneOriginal = data.fluidDuotoneOriginal.childImageSharp.fluid
    const fluidDuotone25 = data.fluidDuotone25.childImageSharp.fluid
    const fluidDuotone50 = data.fluidDuotone50.childImageSharp.fluid
    const fluidDuotone75 = data.fluidDuotone75.childImageSharp.fluid
    const fluidDuotone = data.fluidDuotone.childImageSharp.fluid

    return (
      <Layout>
        <p>
          <a href="https://www.gatsbyjs.com/plugins/gatsby-transformer-sharp/">
            <code>gatsby-transformer-sharp</code>
          </a>
          {` `}
          exposes several image processing GraphQL functions built on the
          {` `}
          <a href="https://github.com/lovell/sharp">
            Sharp image processing library
          </a>
          . With it and
          {` `}
          <a href="https://www.gatsbyjs.com/plugins/gatsby-image/">
            Gatsby Image
          </a>
          {` `}
          you can easily add fast, optimized, responsive images to your site.
        </p>
        <p>
          <strong>
            Consult the
            {` `}
            <a href="https://www.gatsbyjs.com/plugins/gatsby-plugin-sharp/">
              documentation
            </a>
            {` `}
            or peep the
            {` `}
            <a href="https://github.com/gatsbyjs/gatsby/tree/master/examples/image-processing">
              code
            </a>
            {` `}
            of this example site for more information.
          </strong>
        </p>

        <h2
          style={{
            clear: `left`,
            paddingTop: rhythm(2),
          }}
        >
          <a href="https://www.gatsbyjs.com/plugins/gatsby-plugin-sharp/#resize">
            <code>
              <strong>resize</strong>
            </code>
          </a>
        </h2>

        <p>
          Easily resize and intelligently crop images given a{` `}
          <code>width</code>
          {` `}
          and optionally a <code>height</code>.
        </p>

        <p>
          The
          {` `}
          <code>rotate</code> option
          {` `}
          exposes Sharp
          {`'`}s{` `}
          <a href="http://sharp.pixelplumbing.com/en/stable/api-operation/#rotate">
            <code>rotate</code>
          </a>
          {` `}.
        </p>

        <h3>
          <code>
            <small>resize(width: 125, height: 125, rotate: 180)</small>
          </code>
        </h3>

        <ul style={{ ...styles.ul, ...styles.row }}>
          {images.map(image => (
            <li style={styles.column20} key={image.node.resize.src}>
              <img
                src={image.node.resize.src}
                alt={image.node.resize.originalName}
              />
            </li>
          ))}
        </ul>
        <p
          style={{
            clear: `left`,
          }}
        >
          We also expose all of Sharp
          {`'`}s{` `}
          <a href="http://sharp.pixelplumbing.com/en/stable/api-resize/#crop">
            <code>crop</code>
          </a>
          {` `}
          options with <code>cropFocus</code>.
        </p>
        <p>
          The default is
          <code>ATTENTION</code>, which the Sharp documentation describes as
          "focus on the region with the highest luminance frequency, color
          saturation and presence of skin tones" – which is why we actually see
          F. Scott Fitzgerald centered in the first thumbnail:
        </p>

        <ul style={{ ...styles.ul, ...styles.row }}>
          <li style={styles.column25}>
            <img
              src={cropDefault.src}
              alt={`File ${cropDefault.originalName} with a default crop`}
            />
          </li>
          <li style={styles.column25}>
            <img
              src={cropBottomLeft.src}
              alt={`File ${cropBottomLeft.originalName} cropped to the bottom left`}
            />
            <p>
              <small>
                <code>cropFocus: SOUTHWEST</code>
              </small>
            </p>
          </li>
          <li style={styles.column25}>
            <img
              src={cropEntropy.src}
              alt={`File ${cropEntropy.originalName} with an "entropy" crop`}
            />
            <p>
              <small>
                <code>cropFocus: ENTROPY</code>
              </small>
            </p>
          </li>
          <li style={styles.column25}>
            <img
              src={cropCenter.src}
              alt={`File ${cropCenter.originalName} cropped to the centre`}
            />
            <p>
              <small>
                <code>cropFocus: CENTER</code>
              </small>
            </p>
          </li>
        </ul>

        <h2
          style={{
            clear: `left`,
            paddingTop: rhythm(2),
          }}
        >
          <a href="https://www.gatsbyjs.com/plugins/gatsby-plugin-sharp/#fluid">
            <code>
              <strong>fluid</strong>
            </code>
          </a>
        </h2>
        <p>
          For when you want an image that stretches across a fluid width
          container but will download the smallest image needed for the device
          e.g. a smartphone will download a much smaller image than a desktop
          device.
        </p>
        <p>
          If the max width of the container for the rendered markdown file is
          800px, the fluid sizes would then be: 200, 400, 800, 1200, 1600, 2400
          – enough to provide close to the optimal image size for every device
          size / screen resolution.
        </p>
        <p>
          On top of that, <code>fluid</code>
          {` `}
          returns everything else (namely
          {` `}
          <code>aspectRatio</code>
          {` `}
          and a{` `}
          <code>base64</code>
          {` `}
          image to use as a placeholder) you need to implement the {`"blur up"`}
          technique popularized by
          {` `}
          <a href="https://jmperezperez.com/medium-image-progressive-loading-placeholder/">
            Medium
          </a>
          {` `}
          and
          {` `}
          <a href="https://code.facebook.com/posts/991252547593574/the-technology-behind-preview-photos/">
            Facebook
          </a>
          {` `}
          (and also available as a Gatsby plugin for Markdown content as
          {` `}
          <a href="https://www.gatsbyjs.com/plugins/gatsby-remark-images/">
            gatsby-remark-images
          </a>
          ).
        </p>
        <p>
          The <code>duotone</code> option (see
          {` `}
          <a href="https://alistapart.com/article/finessing-fecolormatrix">I</a>
          ,{` `}
          <a href="http://blog.72lions.com/blog/2015/7/7/duotone-in-js">II</a>,
          {` `}
          <a href="https://ines.io/blog/dynamic-duotone-svg-jade">III</a>
          ), given two hex colors
          {` `}
          <code>shadow</code>
          {` `}
          and <code>highlight</code> defining start and end color of the duotone
          gradient, converts the source image colors to match a gradient color
          chosen based on each pixels relative luminance.
        </p>

        <p>
          The <code>toFormat</code> option lets you convert the source image to
          another image format. We use {`"PNG"`} here to ensure that the
          duotoned image does not show any JPG artifacts.
        </p>

        <h3>
          <small>
            fluid(duotone:
            {` `}
            {`{ `}
            highlight: {`"#f00e2e"`}, shadow: {`"#192550"`} {`}`}, toFormat:
            PNG)
          </small>
        </h3>

        <Img fluid={fluid} />

        <h3 style={{ marginTop: rhythm(2) }}>
          <small>
            fluid(duotone:
            {` `}
            {`{ `}
            highlight: {`"#0ec4f1"`}, shadow: {`"#192550"`}, opacity: 50 {`}`})
          </small>
        </h3>

        <div style={styles.row}>
          <div style={styles.column20}>
            <Img fluid={fluidDuotoneOriginal} />
          </div>
          <div style={styles.column20}>
            <Img fluid={fluidDuotone25} />
          </div>
          <div style={styles.column20}>
            <Img fluid={fluidDuotone50} />
          </div>
          <div style={styles.column20}>
            <Img fluid={fluidDuotone75} />
          </div>
          <div style={styles.column20}>
            <Img fluid={fluidDuotone} />
          </div>
        </div>

        <p>
          By setting an optional third parameter
          {` `}
          <code>opacity</code> for <code>duotone</code>, a semi-transparent
          version of the duotone
          {`'`}d image will be composited over the original allowing the
          original image and its colors to partially {`"`}
          shine through
          {`"`}.
        </p>

        <h2
          style={{
            paddingTop: rhythm(2),
          }}
        >
          <a href="https://www.gatsbyjs.com/plugins/gatsby-plugin-sharp/#fixed">
            <code>fixed</code>
          </a>
        </h2>
        <p>
          For when you want a fixed sized image but that has different sized
          thumbnails for screens that support different density of images
        </p>
        <p>
          Automatically create images for different resolutions — we do 1x,
          1.5x, and 2x.
          {` `}
        </p>

        <p>
          The
          {` `}
          <code>grayscale</code> option
          {` `}
          uses Sharp
          {`'`}s{` `}
          <a href="http://sharp.pixelplumbing.com/en/stable/api-colour/#greyscale">
            <code>greyscale</code>
          </a>
          {` `}
          to convert the source image to 8-bit greyscale, 256 shades of grey.
        </p>

        <Img fixed={fixed} />
      </Layout>
    )
  }
}

const styles = {}

styles.row = {
  display: `flex`,
  flexWrap: `wrap`,
  margin: `8px -4px 1rem`,
}

styles.ul = {
  padding: `0`,
  listStyle: `none`,
}

styles.column20 = {
  flexShrink: 0,
  flexGrow: 0,
  color: `#999`,
  width: `20%`,
  padding: `0 4px`,
  margin: 0,
}

styles.column25 = {
  flexShrink: 0,
  flexGrow: 0,
  color: `#999`,
  width: `25%`,
  padding: `0 4px`,
  margin: 0,
}

export default Index

export const pageQuery = graphql`
  query {
    allImageSharp {
      edges {
        node {
          ... on ImageSharp {
            resize(width: 125, height: 125, rotate: 180) {
              src
            }
          }
        }
      }
    }
    fluidImages: file(
      relativePath: { regex: "/fecolormatrix-kanye-west.jpg/" }
    ) {
      childImageSharp {
        fluid(
          duotone: { highlight: "#f00e2e", shadow: "#192550" }
          traceSVG: {
            color: "#f00e2e"
            turnPolicy: TURNPOLICY_MINORITY
            blackOnWhite: false
          }
          toFormat: PNG
        ) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    fluidDuotone: file(
      relativePath: { regex: "/fecolormatrix-kanye-west.jpg/" }
    ) {
      childImageSharp {
        fluid(
          maxWidth: 120
          duotone: { highlight: "#0ec4f1", shadow: "#192550" }
          traceSVG: { color: "#1E2151" }
        ) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    fluidDuotone50: file(
      relativePath: { regex: "/fecolormatrix-kanye-west.jpg/" }
    ) {
      childImageSharp {
        fluid(
          maxWidth: 120
          duotone: { highlight: "#0ec4f1", shadow: "#192550", opacity: 50 }
          traceSVG: { color: "#A7DEF6" }
        ) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    fluidDuotone75: file(
      relativePath: { regex: "/fecolormatrix-kanye-west.jpg/" }
    ) {
      childImageSharp {
        fluid(
          maxWidth: 120
          duotone: { highlight: "#0ec4f1", shadow: "#192550", opacity: 75 }
          traceSVG: { color: "#0ec4f1" }
        ) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    fluidDuotone25: file(
      relativePath: { regex: "/fecolormatrix-kanye-west.jpg/" }
    ) {
      childImageSharp {
        fluid(
          maxWidth: 120
          traceSVG: { color: "#D1EFFB" }
          duotone: { highlight: "#0ec4f1", shadow: "#192550", opacity: 25 }
        ) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    fluidDuotoneOriginal: file(
      relativePath: { regex: "/fecolormatrix-kanye-west.jpg/" }
    ) {
      childImageSharp {
        fluid(maxWidth: 120, traceSVG: { color: "#e7f7fe" }, toFormat: PNG) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    fixedImages: file(relativePath: { regex: "/lol.jpg/" }) {
      childImageSharp {
        fixed(grayscale: true, width: 500) {
          ...GatsbyImageSharpFixed_withWebp
        }
      }
    }
    cropDefault: file(relativePath: { regex: "/f-scott.jpg/" }) {
      childImageSharp {
        resize(width: 180, height: 180) {
          src
        }
      }
    }
    cropBottomLeft: file(relativePath: { regex: "/f-scott.jpg/" }) {
      childImageSharp {
        resize(width: 180, height: 180, cropFocus: SOUTHWEST) {
          src
        }
      }
    }
    cropEntropy: file(relativePath: { regex: "/f-scott.jpg/" }) {
      childImageSharp {
        resize(width: 180, height: 180, cropFocus: ENTROPY) {
          src
        }
      }
    }
    cropCenter: file(relativePath: { regex: "/f-scott.jpg/" }) {
      childImageSharp {
        resize(width: 180, height: 180, cropFocus: CENTER) {
          src
        }
      }
    }
  }
`
