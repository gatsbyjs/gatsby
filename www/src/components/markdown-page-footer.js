/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import { graphql } from "gatsby"
import { MdCreate as EditIcon } from "react-icons/md"

export default function MarkdownPageFooter({ page, packagePage }) {
  return (
    <Fragment>
      {page && (
        <div
          sx={{
            display: `flex`,
            alignItems: `center`,
            justifyContent: `space-between`,
            mt: 9,
          }}
        >
          <a
            sx={{ variant: `links.muted` }}
            href={`https://github.com/gatsbyjs/gatsby/blob/master/${
              packagePage ? `packages` : `docs`
            }/${page ? page.parent.relativePath : ``}`}
          >
            {/* FIXME relative path probably won't work */}
            <EditIcon sx={{ mr: 2 }} /> Edit this page on GitHub
          </a>
          {page?.latestUpdate && (
            <span sx={{ color: `textMuted`, fontSize: 1 }}>
              Last updated:{` `}
              <time dateTime={page.latestUpdate}>{page.latestUpdate}</time>
            </span>
          )}
        </div>
      )}
    </Fragment>
  )
}

export const fragment = graphql`
  fragment MarkdownPageFooterMdx on DocPage {
    latestUpdate(formatString: "MMMM D, YYYY")
    parent {
      ... on File {
        relativePath
      }
    }
  }
`
