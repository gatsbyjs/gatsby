/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { mediaQueries } from "../../gatsby-plugin-theme-ui"
import ShareMenu from "../../components/share-menu"
import MdLink from "react-icons/lib/md/link"
import MdStar from "react-icons/lib/md/star"

const Meta = ({ starter, repoName, imageSharp, demo }) => (
  <div
    sx={{
      display: `flex`,
      flexDirection: `column-reverse`,
      flexWrap: `wrap`,
      fontFamily: `header`,
      minWidth: `320px`,
      p: 6,
      pt: 0,
      width: `100%`,
      [mediaQueries.sm]: {
        flexDirection: `row`,
        flexWrap: `nowrap`,
        pb: 0,
      },
      [mediaQueries.lg]: {
        px: 8,
        py: 0,
      },
    }}
  >
    <div
      sx={{
        display: `flex`,
        flexShrink: 0,
        flexWrap: `wrap`,
        justifyContent: `space-between`,
        mt: 6,
        pr: 4,
        [mediaQueries.sm]: {
          justifyContent: `flex-start`,
        },
      }}
    >
      <div>
        <span
          sx={{
            alignItems: `center`,
            color: `accent`,
            display: `inline-flex`,
            pr: 5,
          }}
        >
          <MdStar />
          {` `}
          <span sx={{ color: `text.primary`, pl: 1 }}>{starter.stars}</span>
        </span>
      </div>

      <div>
        <span sx={{ pr: 2 }}>Updated</span>
        {showDate(starter.lastUpdated)}
      </div>
    </div>

    <div
      sx={{
        borderBottom: t => `1px solid ${t.colors.ui.border}`,
        display: `flex`,
        flexGrow: 1,
        flexWrap: `nowrap`,
        mr: 4,
        mt: 6,
        pb: 3,
        [mediaQueries.sm]: {
          borderBottom: 0,
        },
      }}
    >
      <div
        sx={{
          pr: 4,
          pb: 4,
          whiteSpace: `nowrap`,
          overflow: `hidden`,
          textOverflow: `ellipsis`,
        }}
      >
        <span sx={{ color: `text.secondary` }}>{`By `}</span>
        <a
          sx={{
            "&&": {
              borderBottom: 0,
              color: `lilac`,
              cursor: `pointer`,
              fontFamily: `header`,
              "&:hover": {
                color: `gatsby`,
              },
            },
          }}
          href={`https://github.com/${starter.owner}`}
        >
          {starter.owner}
        </a>
      </div>
      <div
        css={{
          flex: `2 0 auto`,
          textAlign: `right`,
          position: `relative`,
          zIndex: 1,
        }}
      >
        <div
          sx={{
            position: `absolute`,
            right: t => t.space[6],
            top: 0,
            left: `auto`,
            zIndex: 1,
            display: `flex`,
          }}
        >
          <a
            href={demo}
            sx={{
              border: 0,
              borderRadius: 1,
              fontFamily: `header`,
              fontWeight: `bold`,
              mr: 2,
              py: 1,
              px: 4,
              "&&": {
                backgroundColor: `accent`,
                borderBottom: `none`,
                color: `gatsby`,
              },
            }}
          >
            <MdLink style={{ verticalAlign: `sub` }} />
            {` Visit demo `}
          </a>
          <ShareMenu
            url={`https://github.com/${starter.githubFullName}`}
            title={`Check out ${repoName} on the @Gatsby Starter Showcase!`}
            image={imageSharp.childImageSharp.resize.src}
            theme={`accent`}
          />
        </div>
      </div>
    </div>
  </div>
)

function showDate(dt) {
  const date = new Date(dt)
  return date.toLocaleDateString(`en-US`, {
    month: `short`,
    day: `numeric`,
    year: `numeric`,
  })
}

export default Meta
