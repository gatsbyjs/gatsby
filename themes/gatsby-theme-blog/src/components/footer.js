import React from "react"
import { css } from "theme-ui"

class Footer extends React.Component {
  render() {
    return (
      <footer
        css={css({
          mt: 3,
          pt: 1,
        })}
      >
        <a
          href="https://twitter.com/amber1ey"
          target="_blank"
          rel="noopener noreferrer"
        >
          twitter
        </a>
        {` `}
        &bull;{` `}
        <a
          href="https://github.com/amberleyromo"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>
        {` `}
      </footer>
    )
  }
}

export default Footer
