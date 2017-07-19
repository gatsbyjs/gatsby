import React from "react"
import Helmet from "react-helmet"
import moment from "moment"

class PostPublished extends React.Component {
  render() {
    const frontmatter = this

    if (frontmatter.updated === null) {
      var published = (
        <div className="date-published">
          <p>
            <em>
              published {moment(frontmatter.written).format(`D MMM YYYY`)}
            </em>
          </p>
        </div>
      )
    } else {
      var published = (
        <div className="date-published">
          <p>
            <em>
              originally published{` `}
              {moment(frontmatter.written).format(`D MMM YYYY`)} and updated{` `}
              {moment(frontmatter.updated).format(`D MMM YYYY`)}
            </em>
          </p>
        </div>
      )
    }

    return (
      <div>
        {published}
      </div>
    )
  }
}

export default PostPublished
