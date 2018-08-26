import React from "react"
import { navigate } from "gatsby"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"
import ArrowBackIcon from "react-icons/lib/md/arrow-back"
import PaginationLink from "./PaginationLink"
import presets, { colors } from "../../utils/presets"
import { options, rhythm } from "../../utils/typography"

class Pagination extends React.Component {
  changePage = e => {
    navigate(`/blog/${e.target.value}`)
  }
  render() {
    const { numPages, currentPage } = this.props.context
    const isFirst = currentPage === 1
    const isLast = currentPage === numPages
    const prevPageNum =
      currentPage - 1 === 1 ? `` : (currentPage - 1).toString()
    const nextPageNum = (currentPage + 1).toString()
    const prevPageLink = isFirst ? null : `/blog/${prevPageNum}`
    const nextPageLink = isLast ? null : `/blog/${nextPageNum}`

    const prevNextLinkStyles = {
      "&&": {
        boxShadow: `none`,
        borderBottom: 0,
        fontFamily: options.headerFontFamily.join(`,`),
        fontWeight: `bold`,
        color: colors.gatsby,
      },
    }

    return (
      <div
        css={{
          display: `flex`,
          justifyContent: `space-between`,
          margin: `${rhythm(1)} 0`,
          flexDirection: `column`,
          [presets.Tablet]: {
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
            marginBottom: rhythm(1 / 2),
            [presets.Tablet]: {
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
            fontFamily: options.headerFontFamily.join(`,`),
          }}
        >
          <span>Showing page &nbsp;</span>
          <select
            value={currentPage === 1 ? `` : currentPage.toString()}
            onChange={this.changePage}
            css={{
              appearance: `none`,
              border: `none`,
              padding: `0.5ch 2ch 0.5ch 0.5ch`,
              color: `rebeccapurple`,
              fontWeight: `bold`,
            }}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <option
                value={`${i === 0 ? `` : i + 1}`}
                key={`pagination-number${i + 1}`}
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
              right: `1.5ch`,
              fill: `rebeccapurple`,
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
