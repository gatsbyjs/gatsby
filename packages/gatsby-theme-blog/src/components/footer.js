import React from "react"

import { rhythm } from "../utils/typography"

class Footer extends React.Component {
  render() {
    return (
      <footer
        style={{
          marginTop: rhythm(2.5),
          paddingTop: rhythm(1),
        }}
      >
        <a
          href="https://twitter.com/amber1ey"
          target="_blank"
          rel="noopener noreferrer"
        >
          twitter
        </a>{" "}
        &bull;{" "}
        <a
          href="https://github.com/amberleyromo"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>{" "}
      </footer>
    )
  }
}

export default Footer
