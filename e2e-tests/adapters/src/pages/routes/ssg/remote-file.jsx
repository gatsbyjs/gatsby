import { graphql } from "gatsby"
import React from "react"

import { GatsbyImage } from "gatsby-plugin-image"
import Layout from "../../../components/layout"

const RemoteFile = ({ data }) => {
  return (
    <Layout>
      {data.allMyRemoteImage.nodes.map(node => {
        return (
          <div key={node.id}>
            <h2>
              <a href={node.publicUrl} data-testid="image-public">
                {node.filename}
              </a>
            </h2>
            <img
              src={node.resize.src}
              width={node.resize.width}
              height={node.resize.height}
              alt=""
              className="resize"
            />
            <div>
              <GatsbyImage className="fixed" image={node.fixed} alt="" />
              <GatsbyImage
                className="constrained"
                image={node.constrained}
                alt=""
              />
              <GatsbyImage
                className="constrained_traced"
                image={node.constrained_traced}
                alt=""
              />
              <GatsbyImage className="full" image={node.full} alt="" />
            </div>
          </div>
        )
      })}
      {data.allMyRemoteFile.nodes.map(node => {
        return (
          <div key={node.id}>
            <h2>
              <a
                href={node.publicUrl}
                data-testid="file-public"
                data-allowed={node.isAllowed}
              >
                {node.filename}
              </a>
            </h2>
          </div>
        )
      })}
    </Layout>
  )
}

export const pageQuery = graphql`
  query SSGImageCDNPageQuery {
    allMyRemoteImage {
      nodes {
        id
        url
        filename
        publicUrl
        resize(width: 100) {
          height
          width
          src
        }
        fixed: gatsbyImage(
          layout: FIXED
          width: 100
          placeholder: DOMINANT_COLOR
        )
        constrained: gatsbyImage(
          layout: CONSTRAINED
          width: 300
          placeholder: BLURRED
        )
        constrained_traced: gatsbyImage(
          layout: CONSTRAINED
          width: 300
          placeholder: TRACED_SVG
        )
        full: gatsbyImage(layout: FULL_WIDTH, width: 500, placeholder: NONE)
      }
    }
    allMyRemoteFile {
      nodes {
        id
        url
        filename
        publicUrl
        isAllowed
      }
    }
  }
`

export default RemoteFile
