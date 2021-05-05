import { graphql } from "gatsby"
import GatsbyImage from "gatsby-image"
import * as React from "react"

import Layout from "../components/layout"
import Grid from "../components/grid"
import SvgImage from "../components/svg-image"

const GatsbyImagePage = ({ data }) => {
  return (
    <Layout>
      <h1>Test legacy gatsby-image</h1>
      <h2>gatsby-image: fluid</h2>
      <Grid data-cy="fluid">
        {data.allContentfulAsset.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.fluid ? (
              <GatsbyImage fluid={node.fluid} />
            ) : (
              <SvgImage src={node.url} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-image: fixed</h2>
      <Grid data-cy="fixed">
        {data.allContentfulAsset.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.fixed ? (
              <GatsbyImage fixed={node.fixed} />
            ) : (
              <SvgImage src={node.url} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-image: WebP</h2>
      <Grid data-cy="webp">
        {data.allContentfulAsset.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.webp ? (
              <GatsbyImage fixed={node.webp} />
            ) : (
              <SvgImage src={node.url} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-image: Traced SVG Placeholder</h2>
      <Grid data-cy="traced">
        {data.allContentfulAsset.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node.traced ? (
              <GatsbyImage fixed={node.traced} />
            ) : (
              <SvgImage src={node.url} />
            )}
          </div>
        ))}
      </Grid>

      <h2>gatsby-image: SQIP Placeholder</h2>
      <Grid data-cy="sqip">
        {data.allContentfulAsset.nodes.map(node => (
          <div>
            <p>
              <strong>
                {node.title} ({node.fileName.split(".").pop()})
              </strong>
            </p>
            {node.description && <p>{node.description}</p>}
            {node?.sqip?.dataURI && node.fixed ? (
              <GatsbyImage
                fixed={{
                  ...node.fixed,
                  base64: node?.sqip?.dataURI,
                }}
              />
            ) : (
              <SvgImage src={node.url} />
            )}
          </div>
        ))}
      </Grid>
    </Layout>
  )
}

export default GatsbyImagePage

export const pageQuery = graphql`
  query GatsbyImageQuery {
    allContentfulAsset(
      filter: {
        sys: {
          id: {
            in: [
              "3ljGfnpegOnBTFGhV07iC1"
              "3BSI9CgDdAn1JchXmY5IJi"
              "65syuRuRVeKi03HvRsOkkb"
            ]
          }
        }
      }
      sort: { fields: sys___id }
    ) {
      nodes {
        title
        description
        fileName
        url
        fluid(maxWidth: 420) {
          ...GatsbyContentfulFluid
        }
        fixed(width: 200) {
          ...GatsbyContentfulFixed
        }
        webp: fixed(width: 200) {
          ...GatsbyContentfulFixed_withWebp
        }
        traced: fixed(width: 200) {
          ...GatsbyContentfulFixed_tracedSVG
        }
        sqip(numberOfPrimitives: 12, blur: 0, mode: 1) {
          dataURI
        }
      }
    }
  }
`
