/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { navigate } from "gatsby"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"
import ArrowBackIcon from "react-icons/lib/md/arrow-back"
import PaginationLink from "./PaginationLink"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

class Pagination extends React.Component {
  changePage = e => {
    navigate(e.target.value ? `/blog/page/${e.target.value}` : `/blog/`)
  }
  render() {
    const { numPages, currentPage } = this.props.context
    const isFirst = currentPage === 1
    const isLast = currentPage === numPages
    const prevPageNum =
      currentPage - 1 === 1 ? `` : `page/${(currentPage - 1).toString()}`
    const nextPageNum = (currentPage + 1).toString()
    const prevPageLink = isFirst ? null : `/blog/${prevPageNum}`
    const nextPageLink = isLast ? null : `/blog/page/${nextPageNum}`

    const prevNextLinkStyles = {
      "&&": {
        borderBottom: 0,
        color: `gatsby`,
      },
    }

    return (
      <div
        sx={{
          display: `flex`,
          justifyContent: `space-between`,
          margin: t => `0 -${t.space[6]}`,
          p: 6,
          flexDirection: `column`,
          fontSize: 1,
          [mediaQueries.md]: {
            background: `transparent`,
            borderTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            flexDirection: `row`,
          },
        }}
      >
        <div
          sx={{
            display: `flex`,
            margin: `0`,
            padding: `0`,
            justifyContent: `space-between`,
            alignItems: `center`,
            mb: 3,
            [mediaQueries.md]: {
              width: `15rem`,
              mb: 0,
            },
          }}
        >
          <PaginationLink to={prevPageLink} sx={prevNextLinkStyles}>
            <ArrowBackIcon style={{ verticalAlign: `sub` }} />
            Newer posts
          </PaginationLink>
          <PaginationLink to={nextPageLink} sx={prevNextLinkStyles}>
            Older posts
            <ArrowForwardIcon style={{ verticalAlign: `sub` }} />
          </PaginationLink>
        </div>
        <div
          sx={{
            display: `flex`,
            alignItems: `center`,
            justifyContent: `flex-end`,
            fontSize: 1,
          }}
        >
          <span>Showing page &nbsp;</span>
          <select
            aria-label="Pagination Dropdown"
            value={currentPage === 1 ? `` : currentPage.toString()}
            onChange={this.changePage}
            sx={{
              appearance: `none`,
              border: `none`,
              padding: `0.5ch 2ch 0.5ch 0.5ch`,
              color: `gatsby`,
              fontWeight: `bold`,
            }}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <option
                value={`${i === 0 ? `` : i + 1}`}
                key={`pagination-number${i + 1}`}
                aria-label={`Goto Page ${i + 1}`}
                aria-current={currentPage === i + 1}
              >
                {i + 1}
              </option>
            ))}
          </select>
          <svg
            width="10"
            height="5"
            viewBox="0 0 10 5"
            sx={{
              position: `relative`,
              right: 4,
              fill: `gatsby`,
              pointerEvents: `none`,
            }}
          >
            <path d="M0 0l5 4.998L10 0z" fillRule="evenodd" />
          </svg>
          <span>of &nbsp;</span>
          <span>{numPages}</span>
        </div>
      </div>
    )
  }
}

export default Pagination
