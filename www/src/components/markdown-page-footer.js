/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql } from "gatsby"
import EditIcon from "react-icons/lib/md/create"

export default class MarkdownPageFooter extends React.Component {
  constructor() {
    super()
    this.state = { feedbackSubmitted: false }
  }
  render() {
    return (
      <>
        <hr sx={{ display: `none` }} />
        {this.props.page && (
          <a
            sx={{ variant: `links.muted`, mt: 9 }}
            href={`https://github.com/gatsbyjs/gatsby/blob/master/${
              this.props.packagePage ? `packages` : `docs`
            }/${this.props.page ? this.props.page.parent.relativePath : ``}`}
          >
            <EditIcon sx={{ marginRight: 2 }} />
            {` `}
            Edit this page on GitHub
          </a>
        )}
      </>
    )
  }
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
