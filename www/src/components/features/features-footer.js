/** @jsx jsx */
import { jsx } from "theme-ui"

const FeaturesFooter = () => (
  <p sx={{ fontSize: 1, mt: 8 }}>
    Want to help keep this information complete, accurate, and up-to-date?
    Please comment
    {` `}
    <a
      href="https://github.com/gatsbyjs/gatsby/issues/16233"
      target="_blank"
      rel="noopener noreferrer"
    >
      here.
    </a>
  </p>
)

export default FeaturesFooter
