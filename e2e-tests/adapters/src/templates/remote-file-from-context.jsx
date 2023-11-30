import React from "react"

import { GatsbyImage } from "gatsby-plugin-image"
import Layout from "../components/layout"

const RemoteFile = ({ pageContext: data }) => {
  return (
    <Layout>
      {data.allMyRemoteFile.nodes.map(node => {
        return (
          <div key={node.id}>
            <h2>
              <a href={node.publicUrl} data-testid="public">
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
    </Layout>
  )
}

export default RemoteFile
