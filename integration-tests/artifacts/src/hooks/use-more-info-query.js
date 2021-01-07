import { useStaticQuery, graphql } from "gatsby"

export const useMoreInfoQuery = () => {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          moreInfo
        }
      }
    }
  `)
  return data
}
