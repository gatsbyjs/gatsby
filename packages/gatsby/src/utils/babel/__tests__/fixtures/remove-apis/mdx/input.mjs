import GATSBY_COMPILED_MDX from "/Users/lejoe/code/work/gatsby/examples/using-mdx/content/posts/blog-2.mdx"
import React from "react"
import {graphql} from "gatsby"
import {MDXProvider} from "@mdx-js/react"
import {components} from "../components/shortcodes"

const PostsTemplate = ({data, children}) => {
  return React.createElement(React.Fragment, null, React.createElement("h1", null, data.mdx.frontmatter.title), React.createElement(MDXProvider, {
    components: components
  }, children))
}

export default function GatsbyMDXWrapper(props) {
  return React.createElement(PostsTemplate, props, React.createElement(GATSBY_COMPILED_MDX, props))
}

export const Head = ({data}) => React.createElement("title", null, data.mdx.frontmatter.title)

export const query = graphql`
  query($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
      }
    }
  }
`;