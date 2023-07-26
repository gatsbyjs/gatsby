import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

const Footer = () => {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          siteDescription
        }
      }
    }
  `)

  return (
    <footer style={footerStyles}>
      {data.site.siteMetadata.siteDescription}
    </footer>
  )
}

export default Footer

const footerStyles = {
  color: "#787483",
  paddingLeft: 72,
  paddingRight: 72,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}