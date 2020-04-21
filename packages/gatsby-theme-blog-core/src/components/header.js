import React from "react"
import { Link } from "gatsby"
import Bio from "../components/bio"

const rootPath = `${__PATH_PREFIX__}/`

const Title = ({ children, location }) => {
  if (location.pathname === rootPath) {
    return (
      <h1>
        <Link to={`/`}>{children}</Link>
      </h1>
    )
  } else {
    return (
      <h3 as="p">
        <Link to={`/`}>{children}</Link>
      </h3>
    )
  }
}

export default ({ children, title, ...props }) => (
  <header>
    <div>
      <div>
        <Title {...props}>{title}</Title>
        {children}
      </div>
      {props.location.pathname === rootPath && <Bio />}
    </div>
  </header>
)
