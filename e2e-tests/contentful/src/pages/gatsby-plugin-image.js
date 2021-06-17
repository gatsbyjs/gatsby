import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"
import * as React from "react"

import Layout from "../components/layout"
import Grid from "../components/grid"
import SvgImage from "../components/svg-image"

const GatsbyPluginImagePage = ({ data }) => {
  return (
    <Layout>
      <h1>Test gatsby-plugin-image</h1>
      <h2>gatsby-plugin-image: constrained</h2>
      <Grid data-cy="constrained">
        {data.default.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.constrained ? (
              <GatsbyImage image={node.constrained} />
            ) : (
              <SvgImage src={node.file.url} />
            )}
          </div>
        ))}
      </Grid>
      <h2>gatsby-plugin-image: full width</h2>
      <Grid data-cy="full-width">
        {data.default.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.fullWidth ? (
              <GatsbyImage image={node.fullWidth} />
            ) : (
              <SvgImage src={node.file.url} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: fixed</h2>
      <Grid data-cy="fixed">
        {data.default.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.fixed ? (
              <GatsbyImage image={node.fixed} />
            ) : (
              <SvgImage src={node.file.url} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: Dominant Color Placeholder</h2>
      <Grid data-cy="dominant-color">
        {data.default.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.dominantColor ? (
              <GatsbyImage image={node.dominantColor} />
            ) : (
              <SvgImage src={node.file.url} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: Traced SVG Placeholder</h2>
      <Grid data-cy="traced">
        {data.default.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.traced ? (
              <GatsbyImage image={node.traced} />
            ) : (
              <SvgImage src={node.file.url} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: Blurred Placeholder</h2>
      <Grid data-cy="blurred">
        {data.default.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.blurred ? (
              <GatsbyImage image={node.blurred} />
            ) : (
              <SvgImage src={node.file.url} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: SQIP Placeholder</h2>
      <Grid data-cy="sqip">
        {data.default.nodes.map(node => (
          <div>
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
              />
            ) : (
              <SvgImage src={node.file.url} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: English</h2>
      <Grid data-cy="english">
        {data.english.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.constrained ? (
              <GatsbyImage image={node.constrained} />
            ) : (
              <SvgImage src={node.file.url} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: German</h2>
      <Grid data-cy="german">
        {data.german.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.constrained ? (
              <GatsbyImage image={node.constrained} />
            ) : (
              <SvgImage src={node.file.url} />
            )}
          </div>
        ))}
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
