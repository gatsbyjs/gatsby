import React from "react"
import Link from "gatsby-link"

class IndexPage extends React.Component {
  render() {
    console.log(this.props)
    const data = this.props.data
    return (
      <div>
        <h1>Recipes ({data.allRecipes.totalCount})</h1>
        <ul>
          {data.allRecipes.edges.map(({ node }) => {
            return (
              <li>
                {node.title} ({node.preparationTime} mins)
                <img
                  src={node.relationships.image.relationships.imageFile.uri}
                />
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

export default IndexPage

export const pageQuery = graphql`
  query IndexPageQuery {
    allRecipes(sort: { fields: [title] }, limit: 10) {
      totalCount
      edges {
        node {
          title
          preparationTime
          relationships {
            image {
              relationships {
                imageFile {
                  uri
                }
              }
            }
          }
        }
      }
    }
  }
`
