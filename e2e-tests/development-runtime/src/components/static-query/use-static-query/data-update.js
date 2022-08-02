import React from "react"
import { useStaticQuery, graphql } from "gatsby"

function DataUpdate(props) {
  const data = useStaticQuery(graphql`
    {
      markdownRemark(frontmatter: {title: {eq: "Data Update"}}) {
        frontmatter {
          changeMe
          title
        }
      }
    }
  `)

  if (data) {
    return (
      <p {...props}>
        {data.markdownRemark.frontmatter.title}: {data.markdownRemark.frontmatter.changeMe}
      </p>
    )
  }

  return `Error`
}

export default DataUpdate
