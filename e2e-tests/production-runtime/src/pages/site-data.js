import React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { useStaticQuery, graphql } from "gatsby"

const SiteType = () => {
  const data = useStaticQuery(graphql`
    query SiteTypeQuery {
      site {
        buildTime
        siteMetadata {
          description
          title
        }
      }
    }
  `)

  return (
    <Layout>
      <p data-testid="title">{data.site.siteMetadata.title}</p>
      <p data-testid="description">{data.site.siteMetadata.description}</p>
      <p data-testid="buildtime">
        {new Date(data.site.buildTime).toString() !== "Invalid Date" &&
          "buildTime is valid"}
      </p>
      <p data-testid="validdate">
        {new Date("Invalid").toString() === "Invalid Date" &&
          "Invalid dates can be detected"}
      </p>
    </Layout>
  )
}

export const Head = () => <Seo />

export default SiteType
