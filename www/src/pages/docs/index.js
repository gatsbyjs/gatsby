import React from "react"
import Link from "gatsby-link"

import typography, { rhythm } from "../../utils/typography"
import SidebarBody from "../../components/sidebar-body"
import presets from "../../utils/presets"

class IndexRoute extends React.Component {
  render() {
    return (
      <div>
        <h1>Getting started</h1>
        <p>
          Gatsby lets you transform plain text into dynamic blogs and websites
          using the
          latest web technologies. A React.js static site generator.
        </p>
        <p>
          It supports Markdown, HTML, and React.js pages out of the box. Easy to
          add
          support for additional file types.
        </p>
        <h2>Install Gatsby</h2>
        <p>
          Stable version:<br />
          <code>npm install -g gatsby</code>
        </p>
        <p>
          Pre-stable version:<br />
          <code>
            npm install -g gatsby@[version number]
          </code>
        </p>
        <h2>Install Starters</h2>
        <p>
          The best way to get started is by installing Gatsby Starters. There
          are four
          sites that currently works with
          <code>gatsby@1.0.0-alpha16</code>:
        </p>
        <ul>
          <li>
            Gatsby Starter Blog —
            <a href="https://github.com/gatsbyjs/gatsby-starter-blog/tree/1.0">
              https://github.com/gatsbyjs/gatsby-starter-blog/tree/1.0
            </a>
          </li>
          <li>
            Kyle's blog —
            <a href="https://github.com/kyleamathews/blog/tree/master">
              https://github.com/kyleamathews/blog/tree/master
            </a>
          </li>
          <li>
            Gatsbygram —
            <a href="https://github.com/gatsbyjs/gatsby/tree/1.0/examples/gatsbygram">
              https://github.com/gatsbyjs/gatsby/tree/1.0/examples/gatsbygram
            </a>
          </li>
          <li>
            gatsbyjs.org —
            <a href="https://github.com/gatsbyjs/gatsby/tree/1.0/www">
              https://github.com/gatsbyjs/gatsby/tree/1.0/www
            </a>
          </li>
        </ul>
        <h2>Starter Installation Example</h2>
        <p>
          Clone the Gatsby Starter Blog repo:<br />
          <code>
            git clone https://github.com/gatsbyjs/gatsby-starter-blog/
          </code>
        </p>
        <p>
          Go to folder and checkout the
          <code>1.0</code>
          branch.<br />
          <code>
            cd gastsby-starter-blog<br />
            git checkout 1.0
          </code>
        </p>
        <p>
          Install npm packages<br />
          <code>npm install</code>
        </p>
        <p>
          Run on local server<br />
          <code>gatsby develop</code>
        </p>
        <div
          css={{
            display: `block`,
            [presets.Tablet]: {
              display: `none`,
            },
          }}
        >
          <h2>Documentation</h2>
          <SidebarBody inline />
        </div>
      </div>
    )
  }
}

export default IndexRoute
