import React from "react"
import { graphql, Link, useStaticQuery } from "gatsby"

export default function SlicesLayout({ children, size = `medium` }) {
  const data = useStaticQuery(graphql`
    {
      sliceLayoutMetadata {
        title
      }
    }
  `)
  const title = data.sliceLayoutMetadata?.title || `Title`

  let header
  if (size === `large`) {
    header = (
      <h1 className="main-heading" style={{ fontSize: `2em` }}>
        <Link to="/slices/">{title}</Link> <small>a-large-header</small>
      </h1>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/slices/">
        {title}
      </Link>
    )
  }

  return (
    <>
      <header>{header}</header>
      {children}
    </>
  )
}
