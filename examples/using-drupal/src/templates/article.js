import React from "react"

import { rhythm } from "../utils/typography"

class ArticleTemplate extends React.Component {
  render() {
    // console.log(this.props)
    const article = this.props.data.drupalNodeArticle
    let name = `anonymous`
    let picture
    if (article.author) {
      name = article.author.name
      picture = article.author.picture
    }
    let body
    let paragraphedBody
    if (article.body) {
      body = article.body.value

      // Split text on new lnes and put into paragraph elements.
      paragraphedBody = body.split(`\n`).map(split => {
        return `<p>${split}</p>`
      }).join(``)
    }
    return (
      <div>
        <div style={{ display: `flex`, marginBottom: rhythm(1 / 2) }}>
          <div style={{ height: rhythm(2), width: rhythm(2) }}>
            <img
              style={{
                height: `auto`,
                width: `auto`,
                maxWidth: rhythm(2),
                maxHeight: rhythm(2),
                marginRight: rhythm(1 / 2),
              }}
              src={picture}
            />
          </div>
          <div style={{ display: `flex`, flexDirection: `column` }}>
            <h4 style={{ marginBottom: 0 }}>{name}</h4>
            <strong><em>Posted {article.created}</em></strong>
          </div>
        </div>
        <h1>{article.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: paragraphedBody }} />
      </div>
    )
  }
}

export default ArticleTemplate

export const pageQuery = graphql`
  query articleQuery($id: String!) {
    drupalNodeArticle(id: { eq: $id }) {
      title
      created(formatString: "DD-MMM-YYYY")
      author {
        name
        picture
      }
      body {
        value
      }
    }
  }
`
