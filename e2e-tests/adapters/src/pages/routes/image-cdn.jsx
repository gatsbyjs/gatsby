import * as React from "react"
import Layout from "../../components/layout"
import { graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

export default function SSG({ data }) {
  return (
    <Layout>
      Hello Images!
      <h1>Image CDN (gatsbyImage)</h1>
      <ul>
        {data.allUnsplashImage.nodes.map((node, index) => (
          <>
            <li key={node.id + `-gatsby-image`}>
              <GatsbyImage image={getImage(node)} />
            </li>
            <li key={node.id + `-original`}>
              <img src={node.publicUrl} />
            </li>
          </>
        ))}
        {data.allDeployedLocalImage.nodes.map((node, index) => (
          <>
            <li key={node.id + `-gatsby-image`}>
              <GatsbyImage image={getImage(node)} />
            </li>
            {/* <li key={node.id + `-original`}>
              <img src={node.publicUrl} />
            </li> */}
          </>
        ))}
      </ul>
    </Layout>
  )
}

export const query = graphql`
  {
    allUnsplashImage {
      nodes {
        id
        gatsbyImage(width: 200)
        publicUrl
      }
    }
    allDeployedLocalImage {
      nodes {
        id
        gatsbyImage(width: 200, placeholder: NONE)
      }
    }
  }
`
