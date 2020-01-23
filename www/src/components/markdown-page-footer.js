/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql } from "gatsby"
import EditIcon from "react-icons/lib/md/create"
import useLocalizedStrings from "./use-localized-strings"

export default function MarkdownPageFooter({ page, packagePage }) {
  const { text } = useLocalizedStrings("markdownPageFooter")
  return (
    <>
      <hr sx={{ display: `none` }} />
      {page && (
        <a
          sx={{ variant: `links.muted`, mt: 9 }}
          href={`https://github.com/gatsbyjs/gatsby/blob/master/${
            packagePage ? `packages` : `docs`
          }/${page ? page.parent.relativePath : ``}`}
        >
          <EditIcon sx={{ marginRight: 2 }} />
          {` `}
          {text}
        </a>
      )}
    </>
  )
}

export const fragment = graphql`
  fragment MarkdownPageFooterMdx on Mdx {
    parent {
      ... on File {
        relativePath
      }
    }
  }
  fragment MarkdownPageFooter on MarkdownRemark {
    parent {
      ... on File {
        relativePath
      }
    }
  }
`
