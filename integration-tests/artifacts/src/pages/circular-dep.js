import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import CircularComp from "../components/circular-dep-comp"

export const aVar = true

export default function Inline() {
  const { site } = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
  return (
    <div>
      {site.siteMetadata.title}
      <CircularComp />
    </div>
  )
}
