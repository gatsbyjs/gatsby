import Showcase from "../../templates/template-showcase-details"
import { createPagesFromData } from "gatsby"

export default createPagesFromData(
  Showcase,
  graphql`
    {
      allSitesYaml(filter: { main_url: { ne: null } }) {
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
  `,
  // So this API feels extremely fragile. Not sure it'll work.
  // Since we are statically extracting all of this, if this function runs any thing from out of scope
  // it'll immediately fail.
  // maybe that's an OK limitation, or we need a fancier implementation, or we need a different API.
  data => {
    return data.allSitesYaml.nodes.filter(node => {
      if (!node.fields) return false
      if (!node.fields.slug) return false
      if (!node.fields.hasScreenshot) return false
      return true
    })
  }
)
