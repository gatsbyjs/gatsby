/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Trans } from "@lingui/macro"
import { graphql } from "gatsby"
import { MdCreate as EditIcon } from "react-icons/md"

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
                this.props.packagePage ? `packages` : `docs`
              }/${this.props.page ? this.props.page.parent.relativePath : ``}`}
            >
              <Trans>
                <EditIcon sx={{ marginRight: 2 }} /> Edit this page on GitHub
              </Trans>
            </a>
            {this.props.page?.parent?.fields?.gitLogLatestDate && (
              <span sx={{ color: `textMuted`, fontSize: 1 }}>
                Last updated:{` `}
                <time dateTime={this.props.page.parent.fields.gitLogLatestDate}>
                  {this.props.page.parent.fields.gitLogLatestDate}
                </time>
              </span>
            )}
          </div>
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
        fields {
          gitLogLatestDate(formatString: "MMMM D, YYYY")
        }
      }
    }
  }
  fragment MarkdownPageFooter on MarkdownRemark {
    parent {
      ... on File {
        relativePath
        fields {
          gitLogLatestDate(formatString: "MMMM D, YYYY")
        }
      }
    }
  }
`
