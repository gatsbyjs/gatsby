/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { FormattedMessage } from "react-intl"
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
            <FormattedMessage
              id="docs.markdownPageFooter"
              values={{
                icon: <EditIcon sx={{ marginRight: 2 }} />,
              }}
            />
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
