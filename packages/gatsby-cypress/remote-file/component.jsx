import { graphql, useStaticQuery } from "gatsby"
import React from "react"

import { GatsbyImage } from "gatsby-plugin-image"

const RemoteFile = ({ contextData, publicUrl }) => {
  const staticQueryData = useStaticQuery(graphql`
    {
      allMyRemoteFile {
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
    }
  `)

  let data = staticQueryData
  let dataSource = `StaticQuery`
  if (contextData) {
    data = contextData
    dataSource = `PageContext`
  }

  return (
    <>
      {data.allMyRemoteFile.nodes.map(node => (
        <div key={node.id}>
          {publicUrl !== false ? (
            <h2>
              <a href={node.publicUrl} data-testid="public">
                {node.filename}
              </a>
            </h2>
          ) : null}
          <pre>{JSON.stringify({ dataSource }, null, 2)}</pre>
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
      ))}
    </>
  )
}

export default RemoteFile
