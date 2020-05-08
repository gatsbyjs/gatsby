import React, { Fragment } from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Footer from "../components/home-footer"

const Posts = ({ location, posts, siteTitle, socialLinks }) => (
  <Layout location={location} title={siteTitle}>
    <main>
      {posts.map(({ node }) => {
        const title = node.title || node.slug
        return (
          <Fragment key={node.slug}>
            <SEO title="Home" />
            <div>
              <h2>
                <Link to={node.slug}>{title}</Link>
              </h2>
              <small>{node.date}</small>
              <p>{node.excerpt}</p>
            </div>
          </Fragment>
        )
      })}
    </main>
    <Footer socialLinks={socialLinks} />
  </Layout>
)

export default Posts
