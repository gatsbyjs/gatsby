import React from "react"

import PostFooter from "../components/post-footer"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { MDXRenderer } from "gatsby-plugin-mdx"

const Post = ({
  data: {
    post,
    site: {
      siteMetadata: { title },
    },
  },
  location,
  previous,
  next,
}) => (
  <Layout location={location} title={title}>
    <SEO title={post.title} description={post.excerpt} />
    <main>
      <h1>{post.title}</h1>
      <p>{post.date}</p>
      <MDXRenderer>{post.body}</MDXRenderer>
    </main>
    <PostFooter {...{ previous, next }} />
  </Layout>
)

export default Post
