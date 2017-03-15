import React from "react";
import Link from "gatsby-link";

import typography, { rhythm } from "../../utils/typography";
import SidebarBody from "../../components/sidebar-body";
import presets from "../../utils/presets";

class IndexRoute extends React.Component {
  render() {
    return (
      <div>
        <h1>Getting started</h1>
        <p>
          Gatsby lets you transform plain text into dynamic blogs and websites using
          the latest web technologies. A React.js static site generator.
        </p>
        <p>
          It supports Markdown, HTML, and React.js pages out of the box. Easy to
          add support for additional file types.
        </p>
        <h2>Install</h2>
        <p><code>npm install -g gatsby</code></p>
        <p>
          TBD best way to get started — official starters still (with official
          themes underneath?
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
    );
  }
}

export default IndexRoute;

export const pageQuery = `
`;
