import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"

const IndexPage = () => (
  <Layout>
    <h1>Gatsby Contentful Cypress Tests</h1>
    <h2>Media Rendering</h2>
    <ul>
      <li>
        <Link to="/gatsby-plugin-image">/gatsby-plugin-image</Link>
      </li>
      <li>
        <Link to="/gatsby-image-cdn">/gatsby-image-cdn</Link>
      </li>
      <li>
        <Link to="/download-local">/download-local</Link>
      </li>
    </ul>
    <h2>Content Rendering</h2>
    <ul>
      <li>
        <Link to="/boolean">/boolean</Link>
      </li>
      <li>
        <Link to="/content-reference">/content-reference</Link>
      </li>
      <li>
        <Link to="/date">/date</Link>
      </li>
      <li>
        <Link to="/json">/json</Link>
      </li>
      <li>
        <Link to="/location">/location</Link>
      </li>
      <li>
        <Link to="/media-reference">/media-reference</Link>
      </li>
      <li>
        <Link to="/number">/number</Link>
      </li>
      <li>
        <Link to="/rich-text">/rich-text</Link>
      </li>
      <li>
        <Link to="/text">/text</Link>
      </li>
    </ul>
    <h2>Metadata</h2>
    <ul>
      <li>
        <Link to="/tags">/tags</Link>
      </li>
    </ul>
  </Layout>
)

export default IndexPage
