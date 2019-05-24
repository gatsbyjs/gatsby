import React from "react"
import { css, Styled } from "theme-ui"

class Footer extends React.Component {
  render() {
    return (
      <footer
        css={css({
          mt: 4,
          pt: 3,
        })}
      >
        <Styled.a
          href="https://twitter.com/amber1ey"
          target="_blank"
          rel="noopener noreferrer"
        >
          twitter
        </Styled.a>
        {` `}
        &bull;{` `}
        <Styled.a
          href="https://github.com/amberleyromo"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </Styled.a>
        {` `}
      </footer>
    )
  }
}

export default Footer
