import React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { useStaticQuery, graphql } from "gatsby"

const SiteType = () => {
  const data = useStaticQuery(graphql`
    query SiteTypeQuery {
      site {
        buildTime
        host
        siteMetadata {
          description
          social {
            twitter
          }
          title
        }
      }
    }
  `)

  return (
    <Layout>
      <p data-testid="title">{data.site.siteMetadata.title}</p>
      <p data-testid="description">
        {data.site.siteMetadata.description === null
          ? "description is null"
          : "description is not null"}
      </p>
      <p data-testid="twitter">{data.site.siteMetadata.social.twitter}</p>
      <p data-testid="buildtime">
        {new Date(data.site.buildTime).toString() !== "Invalid Date" &&
          "buildTime is valid"}
      </p>
      <p data-testid="validdate">
        {new Date("Invalid").toString() === "Invalid Date" &&
          "Invalid dates can be detected"}
      </p>
      <p data-testid="host">{data.site.host}</p>
    </Layout>
  )
}

export const Head = () => <Seo title="Site Data" />

export default SiteType
