import { graphql, useStaticQuery } from "gatsby"

export default () => {
  const data = useStaticQuery(graphql`
    {
      notesConfig(id: { eq: "gatsby-theme-notes-config" }) {
        notesPath
        homeText
        breadcrumbSeparator
      }
    }
  `)

  return data.notesConfig
}
