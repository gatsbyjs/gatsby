/** @jsx jsx */
import { jsx } from "theme-ui"
import { MdLink, MdStar } from "react-icons/md"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import ShareMenu from "../../components/share-menu"
import Button from "../../components/button"

const Meta = ({ starter, repoName, imageSharp, demo }) => (
  <div
    sx={{
      display: `flex`,
      flexDirection: `column-reverse`,
      flexWrap: `wrap`,
      fontFamily: `heading`,
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
        [mediaQueries.sm]: {
          pr: 4,
          justifyContent: `flex-start`,
        },
      }}
    >
      <div>
        <span
          sx={{
            alignItems: `center`,
            color: `textMuted`,
            display: `inline-flex`,
            [mediaQueries.sm]: { pr: 5 },
          }}
        >
          <MdStar />
          {` `}
          <span sx={{ color: `text`, pl: 1 }}>{starter.stars}</span>
        </span>
      </div>

      <div>Updated {showDate(starter.lastUpdated)}</div>
    </div>

    <div
      sx={{
        borderBottom: 1,
        borderColor: `ui.border`,
        display: `flex`,
        flexGrow: 1,
        flexWrap: `nowrap`,
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
        By{` `}
        <a
          sx={{
            "&&": {
              borderBottom: 0,
              color: `lilac`,
              cursor: `pointer`,
              fontFamily: `heading`,
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
            right: 0,
            top: 0,
            left: `auto`,
            zIndex: 1,
            display: `flex`,
          }}
        >
          <Button
            tag="href"
            to={demo}
            overrideCSS={{ mr: 2 }}
            icon={<MdLink />}
          >
            Visit demo
          </Button>
          <ShareMenu
            url={`https://github.com/${starter.githubFullName}`}
            title={`Check out ${repoName} on the @gatsbyjs Starter Showcase!`}
            image={imageSharp.childImageSharp.resize.src}
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
