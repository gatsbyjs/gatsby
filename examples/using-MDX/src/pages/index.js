import React from "react"
import { Link } from "gatsby"
import Image from "../components/image"

const IndexPage = () => (
  <>
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
      <Image />
    </div>
    <Link to="/chart-info/">Go to the MDX page</Link>
  </>
)

export default IndexPage
