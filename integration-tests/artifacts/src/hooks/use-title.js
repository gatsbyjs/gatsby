import { useStaticQuery, graphql } from "gatsby"

export const useTitle = () => {
  const { site } = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
  return site.siteMetadata.title
}
