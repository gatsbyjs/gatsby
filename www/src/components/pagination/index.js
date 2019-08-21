import React from "react"
import { navigate } from "gatsby"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"
import ArrowBackIcon from "react-icons/lib/md/arrow-back"
import PaginationLink from "./PaginationLink"
import { colors, space, mediaQueries, fontSizes } from "../../utils/presets"

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
        color: colors.gatsby,
      },
    }

    return (
      <div
        css={{
          background: colors.ui.background,
          display: `flex`,
          justifyContent: `space-between`,
          margin: `0 -${space[6]}`,
          padding: `${space[6]}`,
          flexDirection: `column`,
          fontSize: fontSizes[1],
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
          css={{
            display: `flex`,
            margin: `0`,
            padding: `0`,
            justifyContent: `space-between`,
            alignItems: `center`,
            marginBottom: space[3],
            [mediaQueries.md]: {
              width: `15rem`,
              marginBottom: 0,
            },
          }}
        >
          <PaginationLink to={prevPageLink} css={prevNextLinkStyles}>
            <ArrowBackIcon style={{ verticalAlign: `sub` }} />
            Newer posts
          </PaginationLink>
          <PaginationLink to={nextPageLink} css={prevNextLinkStyles}>
            Older posts
            <ArrowForwardIcon style={{ verticalAlign: `sub` }} />
          </PaginationLink>
        </div>
        <div
          css={{
            display: `flex`,
            alignItems: `center`,
            justifyContent: `flex-end`,
            fontSize: fontSizes[1],
          }}
        >
          <span>Showing page &nbsp;</span>
          <select
            aria-label="Pagination Dropdown"
            value={currentPage === 1 ? `` : currentPage.toString()}
            onChange={this.changePage}
            css={{
              appearance: `none`,
              border: `none`,
              padding: `0.5ch 2ch 0.5ch 0.5ch`,
              color: colors.gatsby,
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
            css={{
              position: `relative`,
              right: space[4],
              fill: colors.gatsby,
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
