import React from "react"
import * as PropTypes from "prop-types"

import { Link, graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

import { rhythm } from "../utils/typography"
import Layout from "../layouts"

const propTypes = {
  data: PropTypes.object.isRequired,
}

const Product = ({ node }) => (
  <div>
    <Link
      style={{ color: `inherit`, textDecoration: `none` }}
      to={node.gatsbyPath}
    >
      <div
        style={{
          display: `flex`,
          alignItems: `center`,
          borderBottom: `1px solid lightgray`,
          paddingBottom: rhythm(1 / 2),
          marginBottom: rhythm(1 / 2),
        }}
      >
        <div style={{ marginRight: rhythm(1 / 2) }}>
          {node.image[0].gatsbyImageData && (
            <GatsbyImage
              style={{ margin: 0 }}
              image={node.image[0].gatsbyImageData}
            />
          )}
        </div>
        <div style={{ flex: 1 }}>{node.productName.productName}</div>
      </div>
    </Link>
  </div>
)

class IndexPage extends React.Component {
  render() {
    const usProductEdges = this.props.data.us.edges
    const deProductEdges = this.props.data.german.edges
    return (
      <Layout>
        <div style={{ marginBottom: rhythm(2) }}>
          <h2>{`Gatsby's`} integration with the Contentful Image API</h2>
          <Link to="/image-api/">See examples</Link>
          <br />
          <br />
          <br />
          <h2>Localization</h2>
          <p>
            The <code>gatsby-source-contentful</code> plugin offers full support
            for {`Contentful's`} localization features. Our sample space
            includes products localized into both English and German.
          </p>
          <p>
            An entry and asset node are created for each locale following
            fallback rules for missing localization. In addition, each node has
            an additional field added, <code>node_locale</code> so you can
            select for nodes from a single locale
          </p>
          <h3>en-US</h3>
          {usProductEdges.map(({ node }, i) => (
            <Product node={node} key={node.id} />
          ))}
          <br />
          <br />
          <h3>de</h3>
          {deProductEdges.map(({ node }, i) => (
            <Product node={node} key={node.id} />
          ))}
        </div>
      </Layout>
    )
  }
}

IndexPage.propTypes = propTypes

export default IndexPage

export const pageQuery = graphql`
  query {
    us: allContentfulProduct(filter: { node_locale: { eq: "en-US" } }) {
      edges {
        node {
          id
          gatsbyPath(filePath: "/products/{ContentfulProduct.id}")
          productName {
            productName
          }
          image {
            gatsbyImageData(layout: FIXED, width: 75)
          }
        }
      }
    }
    german: allContentfulProduct(filter: { node_locale: { eq: "de" } }) {
      edges {
        node {
          id
          gatsbyPath(filePath: "/products/{ContentfulProduct.id}")
          productName {
            productName
          }
          image {
            gatsbyImageData(layout: FIXED, width: 75)
          }
        }
      }
    }
  }
`
