import * as React from "react"
import BlogLayout from "gatsby-theme-blog/src/components/layout"

const Layout = (props) => <BlogLayout {...props}>{props.children}</BlogLayout>

export default Layout
