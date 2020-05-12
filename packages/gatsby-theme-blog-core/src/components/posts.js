import React, { Fragment } from "react"
import { Link } from "gatsby"

import SEO from "../components/seo"

const Posts = ({ posts }) => (
  <>
    <main>
      {posts.map(({ node }) => {
        const title = node.title || node.slug
        return (
          <Fragment key={node.slug} className="post">
            <SEO title="Home" />
            <div>
              <h2>
                <Link to={node.slug} className="post-title">
                  {title}
                </Link>
              </h2>
              <small className="post-date">{node.date}</small>
              <p className="post-excerpt">{node.excerpt}</p>
            </div>
          </Fragment>
        )
      })}
    </main>
  </>
)

export default Posts
