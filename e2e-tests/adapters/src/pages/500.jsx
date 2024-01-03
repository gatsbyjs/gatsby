import * as React from "react"
import { Link } from "gatsby"

const pageStyles = {
  color: "#232129",
  padding: "96px",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
  maxWidth: 320,
}

const paragraphStyles = {
  marginBottom: 48,
}

const InternalServerErrorPage = () => (
  <main style={pageStyles}>
    <h1 style={headingStyles}>INTERNAL SERVER ERROR (custom)</h1>
    <p style={paragraphStyles}>
      <Link to="/">Go home</Link>
    </p>
  </main>
)

export const Head = () => <title>500: Internal Server Error</title>

export default InternalServerErrorPage
