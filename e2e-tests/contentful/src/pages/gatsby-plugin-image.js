import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"
import * as React from "react"
import { useContentfulImage } from "gatsby-source-contentful/hooks"

import Layout from "../components/layout"
import Grid from "../components/grid"
import SvgImage from "../components/svg-image"

const GatsbyPluginImagePage = ({ data }) => {
  const dynamicImage = useContentfulImage({
    image: {
      url: "//images.ctfassets.net/k8iqpp6u0ior/3BSI9CgDdAn1JchXmY5IJi/f97a2185b3395591b98008647ad6fd3c/camylla-battani-AoqgGAqrLpU-unsplash.jpg",
      width: 2000,
      height: 1000,
    },
  })

  return (
    <Layout>
      <h1>Test gatsby-plugin-image</h1>
      <h2>gatsby-plugin-image: constrained</h2>
      <Grid data-cy="constrained">
        {data.default.nodes.map(node => (
          <div key={node.title}>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.constrained ? (
              <GatsbyImage image={node.constrained} alt={node.title} />
            ) : (
              <SvgImage src={node.file.url} alt={node.title} />
            )}
          </div>
        ))}
      </Grid>
      <h2>gatsby-plugin-image: full width</h2>
      <Grid data-cy="full-width">
        {data.default.nodes.map(node => (
          <div key={node.title}>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.fullWidth ? (
              <GatsbyImage image={node.fullWidth} alt={node.title} />
            ) : (
              <SvgImage src={node.file.url} alt={node.title} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: fixed</h2>
      <Grid data-cy="fixed">
        {data.default.nodes.map(node => (
          <div key={node.title}>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.fixed ? (
              <GatsbyImage image={node.fixed} alt={node.title} />
            ) : (
              <SvgImage src={node.file.url} alt={node.title} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: Dominant Color Placeholder</h2>
      <Grid data-cy="dominant-color">
        {data.default.nodes.map(node => (
          <div key={node.title}>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.dominantColor ? (
              <GatsbyImage image={node.dominantColor} alt={node.title} />
            ) : (
              <SvgImage src={node.file.url} alt={node.title} />
            )}
          </div>
        ))}
      </Grid>

      <h2>
        gatsby-plugin-image: Traced SVG Placeholder (fallback to DOMINANT_COLOR)
      </h2>
      <Grid data-cy="traced">
        {data.default.nodes.map(node => (
          <div key={node.title}>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.traced ? (
              <GatsbyImage image={node.traced} alt={node.title} />
            ) : (
              <SvgImage src={node.file.url} alt={node.title} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: Blurred Placeholder</h2>
      <Grid data-cy="blurred">
        {data.default.nodes.map(node => (
          <div key={node.title}>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.blurred ? (
              <GatsbyImage image={node.blurred} alt={node.title} />
            ) : (
              <SvgImage src={node.file.url} alt={node.title} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: Custom Image Formats (WebP & AVIF)</h2>
      <Grid data-cy="customImageFormats">
        {data.default.nodes.map(node => (
          <div key={node.title}>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.customImageFormats ? (
              <GatsbyImage image={node.customImageFormats} alt={node.title} />
            ) : (
              <SvgImage src={node.file.url} alt={node.title} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: SQIP Placeholder</h2>
      <Grid data-cy="sqip">
        {data.default.nodes.map(node => (
          <div key={node.title}>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.fixed && node?.sqip?.dataURI ? (
              <GatsbyImage
                image={{
                  ...node.fixed,
                  placeholder: node?.sqip?.dataURI
                    ? { fallback: node.sqip.dataURI }
                    : null,
                }}
                alt={node.title}
              />
            ) : (
              <SvgImage src={node.file.url} alt={node.title} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: English</h2>
      <Grid data-cy="english">
        {data.english.nodes.map(node => (
          <div key={node.title}>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.constrained ? (
              <GatsbyImage image={node.constrained} alt={node.title} />
            ) : (
              <SvgImage src={node.file.url} alt={node.title} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: German</h2>
      <Grid data-cy="german">
        {data.german.nodes.map(node => (
          <div key={node.title}>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.constrained ? (
              <GatsbyImage image={node.constrained} alt={node.title} />
            ) : (
              <SvgImage src={node.file.url} alt={node.title} />
            )}
          </div>
        ))}
      </Grid>

      <h2>
        gatsby-plugin-image: On the fly image generation via{" "}
        <code>useContentfulImage</code>
      </h2>
      <Grid data-cy="hook">
        <GatsbyImage image={dynamicImage} alt="Image on the fly" />
      </Grid>
    </Layout>
  )
}

export default GatsbyPluginImagePage

export const pageQuery = graphql`
  query GatsbyPluginImageQuery {
    default: allContentfulAsset(
      filter: {
        contentful_id: {
          in: [
            "3ljGfnpegOnBTFGhV07iC1"
            "3BSI9CgDdAn1JchXmY5IJi"
            "65syuRuRVeKi03HvRsOkkb"
          ]
        }
        node_locale: { eq: "en-US" }
      }
      sort: { fields: contentful_id }
    ) {
      nodes {
        title
        description
        file {
          fileName
          url
        }
        constrained: gatsbyImageData(width: 420)
        fullWidth: gatsbyImageData(width: 200, layout: FIXED)
        fixed: gatsbyImageData(width: 200, layout: FIXED)
        dominantColor: gatsbyImageData(
          width: 200
          layout: FIXED
          placeholder: DOMINANT_COLOR
        )
        traced: gatsbyImageData(
          width: 200
          layout: FIXED
          placeholder: TRACED_SVG
        )
        blurred: gatsbyImageData(
          width: 200
          layout: FIXED
          placeholder: BLURRED
        )
        customImageFormats: gatsbyImageData(formats: [AVIF, WEBP, AUTO])
        sqip(numberOfPrimitives: 12, blur: 0, mode: 1) {
          dataURI
        }
      }
    }
    english: allContentfulAsset(
      filter: {
        contentful_id: { in: ["4FwygYxkL3rAteERtoxxNC"] }
        node_locale: { eq: "en-US" }
      }
      sort: { fields: contentful_id }
    ) {
      nodes {
        title
        description
        file {
          fileName
          url
        }
        constrained: gatsbyImageData(width: 420)
      }
    }
    german: allContentfulAsset(
      filter: {
        contentful_id: { in: ["4FwygYxkL3rAteERtoxxNC"] }
        node_locale: { eq: "de-DE" }
      }
      sort: { fields: contentful_id }
    ) {
      nodes {
        title
        description
        file {
          fileName
          url
        }
        constrained: gatsbyImageData(width: 420)
      }
    }
  }
`
