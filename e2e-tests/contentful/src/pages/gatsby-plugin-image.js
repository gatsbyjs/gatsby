import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"
import * as React from "react"

import Layout from "../components/layout"
import Grid from "../components/grid"

const GatsbyPluginImagePage = ({ data }) => {
  return (
    <Layout>
      <h1>Test gatsby-plugin-image</h1>
      <h2>gatsby-plugin-image: constrained</h2>
      <Grid data-cy="constrained">
        {data.allContentfulAsset.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            <GatsbyImage image={node.constrained}></GatsbyImage>
          </div>
        ))}
      </Grid>
      <h2>gatsby-plugin-image: full width</h2>
      <Grid data-cy="full-width">
        {data.allContentfulAsset.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            <GatsbyImage image={node.fullWidth}></GatsbyImage>
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: fixed</h2>
      <Grid data-cy="fixed">
        {data.allContentfulAsset.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            <GatsbyImage image={node.fixed}></GatsbyImage>
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: Dominant Color Placeholder</h2>
      <Grid data-cy="dominant-color">
        {data.allContentfulAsset.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            <GatsbyImage
              image={node.dominantColor}
              backgroundColor={node.dominantColor.backgroundColor}
            />
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: Traced SVG Placeholder</h2>
      <Grid data-cy="traced">
        {data.allContentfulAsset.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            <GatsbyImage image={node.traced} />
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: Blurred Placeholder</h2>
      <Grid data-cy="blurred">
        {data.allContentfulAsset.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            <GatsbyImage image={node.blurred} />
          </div>
        ))}
      </Grid>

      <h2>gatsby-plugin-image: SQIP Placeholder</h2>
      <Grid data-cy="sqip">
        {data.allContentfulAsset.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.file.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            <GatsbyImage
              image={{
                ...node.fixed,
                placeholder: node?.sqip?.dataURI
                  ? { fallback: node.sqip.dataURI }
                  : null,
              }}
            />
          </div>
        ))}
      </Grid>
    </Layout>
  )
}

export default GatsbyPluginImagePage

export const pageQuery = graphql`
  query GatsbyPluginImageQuery {
    allContentfulAsset(
      filter: {
        contentful_id: {
          in: ["3ljGfnpegOnBTFGhV07iC1", "3BSI9CgDdAn1JchXmY5IJi"]
        }
      }
      sort: { fields: contentful_id }
    ) {
      nodes {
        title
        description
        file {
          fileName
        }
        constrained: gatsbyImageData(width: 420, layout: CONSTRAINED)
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
  }
`
