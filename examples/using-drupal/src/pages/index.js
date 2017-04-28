import React from "react"

class IndexPage extends React.Component {
  render() {
    console.log(this.props)
    const articleEdges = this.props.data.allDrupalNodeArticle.edges
    return (
      <div>
        {articleEdges.map(edge => {
          const article = edge.node
          let body
          if (article.body) {
            body = article.body.value
          }
          console.log(article)
          return (
            <div>
              <h1>{article.title}</h1>
              <small>{article.created}</small>
              <p dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          )
        })}
      </div>
    )
  }
}

export default IndexPage

export const pageQuery = `
{
  allDrupalNodeArticle(sortBy: { fields: [created], order: DESC }) {
    edges {
      node {
        title
        created(formatString: "DD-MMM-YYYY")
        body {
          value
        }
      }
    }
  }
}
`
