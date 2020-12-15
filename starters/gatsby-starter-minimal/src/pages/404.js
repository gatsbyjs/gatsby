import * as React from "react"
import { Link } from "gatsby"

// styles
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
const codeStyles = {
  color: "#8A6534",
  padding: 4,
  backgroundColor: "#FFF4DB",
  fontSize: "1.25rem",
  borderRadius: 4,
}

// markup
const IndexPage = () => {
  return (
    <main style={pageStyles}>
      <title>Not found</title>
      <h1 style={headingStyles}>Page not found</h1>
      <p style={paragraphStyles}>
        Sorry{" "}
        <span role="img" aria-label="Pensive emoji">
          😔
        </span>{" "}
        we couldn’t find what you were looking for. <Link to="/">Go home</Link>.
      </p>
      {process.env.NODE_ENV === "development" ? (
        <>
          <p>
            Try creating a page in <code style={codeStyles}>src/pages/</code>.
          </p>
          <ul style={listStyles}>
            {links.map(link => (
              <li style={listItemStyles}>
                <a
                  style={linkStyles}
                  href={`${link.url}?utm_source=starter&utm_medium=404-page&utm_campaign=minimal-starter`}
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </main>
  )
}

export default IndexPage
