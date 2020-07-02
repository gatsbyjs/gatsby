/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import { graphql } from "gatsby"
import { MdCreate as EditIcon } from "react-icons/md"

export default function MarkdownPageFooter({ page }) {
  return (
    <Fragment>
      {page && (
        <div
          sx={{
            display: `flex`,
            alignItems: `center`,
            mt: 9,
          }}
        >
          <a
            sx={{ variant: `links.muted` }}
            href={`https://github.com/gatsbyjs/gatsby/blob/master/docs/${
              page ? page.parent.relativePath : ``
            }`}
          >
            {/* FIXME relative path probably won't work */}
            <EditIcon sx={{ mr: 2 }} /> Edit this page on GitHub
          </a>
        </div>
      )}
    </Fragment>
  )
}

export const fragment = graphql`
  fragment MarkdownPageFooterMdx on DocPage {
    parent {
      ... on File {
        relativePath
      }
    }
  }
`
