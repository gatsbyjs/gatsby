import React from "react"
import Link from "gatsby-link"
import Container from "../components/container"

export default () => (
  <Container>
    <h1 css={{ marginTop: 0 }}>Gatsby.js Tutorial</h1>
    <p>
      Hi! We’re so happy you decided to try using Gatsby. This tutorial has (or
      rather will have once all parts are written) five parts that'll walk you
      from getting started developing and building Gatsby sites to deploying a
      finished and polished high performance static PWA.
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
        </Link>. Explore libraries like Typography.js, CSS Modules, Glamor, and
        Styled Components.
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
        we'll build a simple markdown blog.
      </li>
      <li>
        Finishing and deploying a website. React Helmet. We walk through how to
        put the finishing touches on a website project.
      </li>
    </ol>
  </Container>
)
