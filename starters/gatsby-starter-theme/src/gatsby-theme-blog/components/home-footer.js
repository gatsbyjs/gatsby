import React, { Fragment } from "react"
import { Link } from "gatsby"
import { Themed, css } from "theme-ui"

const Footer = ({ socialLinks }) => (
  <footer
    css={css({
      mt: 4,
      pt: 3,
    })}
  >
    © {new Date().getFullYear()}, Powered by
    {` `}
    <Themed.a href="https://www.gatsbyjs.com">Gatsby</Themed.a>
    {` `}&bull;{` `}
    <Themed.a as={Link} to="/notes">
      Notes
    </Themed.a>
    {` `}&bull;{` `}
    {socialLinks
      ? socialLinks.map((platform, i, arr) => (
        <Fragment key={platform.url}>
          <Themed.a
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {platform.name}
          </Themed.a>
          {arr.length - 1 !== i && (
            <Fragment>
              {` `}&bull;{` `}
            </Fragment>
          )}
        </Fragment>
      ))
      : null}
  </footer>
)
export default Footer
