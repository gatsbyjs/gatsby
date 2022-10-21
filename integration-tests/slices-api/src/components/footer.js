import * as React from "react"

const Footer = () => {
  return (
    <footer>
      © {new Date().getFullYear()}, Built with
      {` `}
      <a href="https://www.gatsbyjs.com">Gatsby</a>
      {` `}
      <i><a href="https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-slice">(and Slices!)</a></i>
    </footer>
  )
}

export default Footer