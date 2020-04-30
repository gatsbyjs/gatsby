import Showcase from "../../../templates/template-showcase-details"
import { createPagesFromData } from "gatsby"

export default createPagesFromData(
  Showcase,
  graphql`
    {
      allSitesYaml(filter: { main_url: { ne: null }, fields: { ne: null, slug: { ne: null }, hasScreenshot: { ne: null } } } {
        nodes {
          id
          title
          main_url
          featured
          categories
          built_by
          built_by_url
          source_url
          description
          childScreenshot {
            screenshotFile {
              childImageSharp {
                resize(
                  width: 1200
                  height: 627
                  cropFocus: NORTH
                  toFormat: JPG
                ) {
                  src
                  height
                  width
                }
              }
            }
          }
          fields {
            cleanedHost
            slug
            hasScreenshot
          }
        }
      }
    }
  `
)
