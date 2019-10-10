import React from "react"
import MDXRenderer from "../../mdx-renderer"

export default props => <MDXRenderer>{props.data.mdx.body}</MDXRenderer>
