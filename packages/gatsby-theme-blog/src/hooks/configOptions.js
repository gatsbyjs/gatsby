import { useStaticQuery, graphql } from "gatsby"

const useBlogThemeConfig = () => {
  const data = useStaticQuery(graphql`
    query {
      blogThemeConfig(id: { eq: "gatsby-theme-blog-config" }) {
        disableThemeUiStyling
      }
    }
  `)

  return data.blogThemeConfig
}

export default useBlogThemeConfig
