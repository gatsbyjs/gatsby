import React from "react"
import moment from "moment"
import PostPublished from "../components/PostPublished"
import HelmetBlock from "../components/HelmetBlock"

class generalBlogPostTemplate extends React.Component {
  render() {
    const {frontmatter} = this.props.pathContext

    return (
      <div className="blogPost">
        <HelmetBlock {...frontmatter} />
        <div className="content">
          <div className="section">
            <div className="container">
              {this.props.children()}
            </div>
          </div>
        </div>
        <PostPublished {...frontmatter} />
      </div>
    )
  }
}

export default generalBlogPostTemplate
