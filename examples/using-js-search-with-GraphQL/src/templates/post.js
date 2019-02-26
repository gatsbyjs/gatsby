import React from 'react'
import { Link } from 'gatsby'

const BlogPost = props => {
  const { pageContext } = props
  const { title, author, content } = pageContext

  return (
    <div
      style={{
        display: 'block',
        margin: '2em auto',
      }}
    >
      <h1 style={{ textAlign: 'center' }}>{title}</h1>
      <div style={{ margin: '2em auto', textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: content }} />
      <p style={{ fontSize: '12px', fontWeight: 'bold' }}>{author}</p>
      <Link to="/">Go back</Link>
    </div>
  )
}
export default BlogPost
