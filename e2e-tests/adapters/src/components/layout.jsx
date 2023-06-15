import * as React from "react"
import { Link } from "gatsby"

const Layout = ({ children, hideBackToHome = false }) => (
  <>
    {!hideBackToHome && (
      <Link to="/" style={backToHomeStyle}>
        Back to Home
      </Link>
    )}
    <main style={pageStyles}>
      {children}
    </main>
  </>
)

export default Layout

const pageStyles = {
  color: "#232129",
  padding: 72,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

const backToHomeStyle = {
  position: "absolute",
  textDecoration: "none",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
  color: "#232129",
  border: '2px solid #8954A8',
  padding: '5px 10px',
  borderRadius: '8px',
}
