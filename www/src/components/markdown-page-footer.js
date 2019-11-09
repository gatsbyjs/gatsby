/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql } from "gatsby"
import moment from "moment"
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
              <EditIcon sx={{ marginRight: 2 }} />
              {` `}
              Edit this page on GitHub
            </a>
            {this.props.page &&
              this.props.page.parent &&
              this.props.page.parent.fields &&
              this.props.page.parent.fields.gitDate && (
                <span sx={{ color: `textMuted`, fontSize: 1 }}>
                  Last updated:{` `}
                  <time
                    dateTime={moment(
                      this.props.page.parent.fields.gitDate
                    ).format(`MMMM D, YYYY`)}
                  >
                    {moment(this.props.page.parent.fields.gitDate).format(
                      `MMMM D, YYYY`
                    )}
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
          gitDate
        }
      }
    }
  }
  fragment MarkdownPageFooter on MarkdownRemark {
    parent {
      ... on File {
        relativePath
        fields {
          gitDate
        }
      }
    }
  }
`
