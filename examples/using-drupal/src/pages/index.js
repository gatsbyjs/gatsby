import React from 'react'
import Link from 'gatsby-link'

class IndexPage extends React.Component {
  render() {
    // console.log(this.props)
    const articleEdges = this.props.data.allDrupalNodeArticle.edges
    return (
      <div>
        {articleEdges.map(edge => {
          const article = edge.node
          let name = `anonymous`
          if (article.author) {
            name = article.author.name
          }
          return (
            <div>
              <Link to={`/node/${article.nid}/`}>
                <h4>
                  <span style={{ color: `gray` }}>{article.created}</span>
                  {` `}
                  |
                  {` `}“{article.title}” by
                  {` `}
                  <em>{name}</em>
                </h4>
              </Link>
            </div>
          )
        })}
      </div>
    )
  }
}

export default IndexPage

export const pageQuery = graphql`
query PageQuery {
  allDrupalNodeArticle(sortBy: { fields: [created], order: DESC }) {
    edges {
      node {
        title
        nid
        created(formatString: "DD-MMM-YYYY")
        author {
          name
        }
      }
    }
  }
}
`
