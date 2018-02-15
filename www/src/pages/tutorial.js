import React from "react"
import Helmet from "react-helmet"
import { Link } from "gatsby"

import Container from "../components/container"

export default () => (
  <Container>
    <Helmet>
      <title>Tutorial</title>
    </Helmet>
    <h1 css={{ marginTop: 0 }}>Gatsby.js Tutorial</h1>
    <p>
      Hi! We’re so happy you decided to try using Gatsby. This tutorial has four
      parts that'll walk you from getting started developing and building Gatsby
      sites to deploying a finished and polished high performance static PWA.
    </p>
    <p>
      This tutorial is for <em>everyone</em>! You do not need to be a programmer
      or React.js expert. We'll walk you through things.
    </p>

    <ol>
      <li>
        <Link to="/tutorial/part-one/">Introduction to basics of Gatsby</Link>
        {` `}— Starting new projects, developing, and deploying sites.
      </li>
      <li>
        <Link to="/tutorial/part-two/">
          Introduction to using CSS in Gatsby
        </Link>. Explore libraries like Typography.js and CSS Modules.
      </li>
      <li>
        <Link to="/tutorial/part-three/">
          Explore building nested layouts in Gatsby
        </Link>. Layouts are sections of your site that are reused across
        multiple pages like headers and footers.
      </li>
      <li>
        <Link to="/tutorial/part-four/">
          Learn how to work with Gatsby's data layer.
        </Link>
        {` `}
        Explore source & transformer plugins. Get introduced to programmatic
        pages and how to write GraphQL queries. In this part of the tutorial
        we'll build a bare-bones markdown blog.
      </li>
    </ol>
  </Container>
)
