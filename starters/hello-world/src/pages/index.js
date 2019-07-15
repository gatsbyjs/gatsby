import React from "react"

export default () => (
  <div>
    <p> Hello </p>
    <footer style={{ position: "fixed", bottom: 0 }}>
      © {new Date().getFullYear()}, Built with {` `}
      <a href="https://www.gatsbyjs.org">Gatsby</a>
    </footer>
  </div>
)
