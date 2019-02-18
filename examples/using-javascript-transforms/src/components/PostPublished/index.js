import React from "react"
import moment from "moment"

class PostPublished extends React.Component {
  render() {
    const frontmatter = this
    let published
    if (frontmatter.updated === null) {
      published = (
        <em>
          `published`
          {moment(frontmatter.written).format(`D MMM YYYY`)}
        </em>
      )
    } else {
      published = (
        <em>
          {`originally published `}
          {moment(frontmatter.written).format(`D MMM YYYY`)}
          {` and updated `}
          {moment(frontmatter.updated).format(`D MMM YYYY`)}
        </em>
      )
    }

    return (
      <div className="container content">
        <div className="date-published">
          <p>{published}</p>
        </div>
      </div>
    )
  }
}

export default PostPublished
