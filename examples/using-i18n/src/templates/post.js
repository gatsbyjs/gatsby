import React from "react"

const Post = ({ pageContext: { locale } }) => (
  <React.Fragment>
    <h1>blogpost</h1>
    <p>{locale}</p>
  </React.Fragment>
)

export default Post
