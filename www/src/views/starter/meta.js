import React from "react"
import presets, { colors } from "../../utils/presets"
import { rhythm, options } from "../../utils/typography"
import sharedStyles from "../shared/styles"
import ShareMenu from "../../components/share-menu"
import MdLaunch from "react-icons/lib/md/launch"
import MdStar from "react-icons/lib/md/star"

const Meta = ({ starter, repoName, imageSharp, demo }) => (
  <div
    css={{
      fontFamily: options.headerFontFamily.join(`,`),
      color: colors.gray.dark,
      display: `flex`,
      flexWrap: `wrap`,
      width: `100%`,
      minWidth: `320px`,
      flexDirection: `column-reverse`,
      padding: sharedStyles.gutter,
      paddingTop: 0,
      [presets.Phablet]: {
        flexDirection: `row`,
        flexWrap: `nowrap`,
        paddingBottom: 0,
      },
      [presets.Desktop]: {
        padding: sharedStyles.gutterDesktop,
        paddingTop: 0,
        paddingBottom: 0,
      },
    }}
  >
    <div
      css={{
        marginTop: rhythm(3 / 4),
        paddingRight: 15,
        display: `flex`,
        flexWrap: `wrap`,
        justifyContent: `space-between`,
        flexShrink: 0,
        [presets.Phablet]: {
          justifyContent: `flex-start`,
        },
      }}
    >
      <div>
        <span
          css={{
            color: colors.accent,
            paddingRight: 10,
          }}
        >
          <MdStar style={{ verticalAlign: `sub` }} />
          {` `}
          <span css={{ color: colors.gray.light }}>{starter.stars}</span>
        </span>
      </div>

      <div>
        <span
          css={{
            color: colors.gray.calm,
            fontFamily: options.headerFontFamily.join(`,`),
            paddingRight: 8,
          }}
        >
          Updated
        </span>
        {showDate(starter.lastUpdated)}
      </div>
    </div>

    <div
      css={{
        marginTop: rhythm(3 / 4),
        marginRight: 15,
        display: `flex`,
        flexWrap: `nowrap`,
        flexGrow: 1,
        borderBottom: `1px solid ${colors.ui.light}`,
        paddingBottom: rhythm(2 / 4),
        [presets.Phablet]: {
          borderBottom: 0,
        },
      }}
    >
      <div
        css={{
          paddingRight: 15,
          paddingBottom: 15,
          whiteSpace: `nowrap`,
          overflow: `hidden`,
          textOverflow: `ellipsis`,
        }}
      >
        <span css={{ color: colors.gray.light }}>{`By  `}</span>
        <a
          css={{
            "&&": {
              boxShadow: `none`,
              borderBottom: 0,
              color: colors.lilac,
              cursor: `pointer`,
              fontFamily: options.headerFontFamily.join(`,`),
              "&:hover": {
                background: `transparent`,
                color: colors.gatsby,
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
          css={{
            position: `absolute`,
            right: rhythm(3 / 4),
            top: rhythm(0 / 8),
            left: `auto`,
            zIndex: 1,
            display: `flex`,
          }}
        >
          <a
            href={demo}
            css={{
              border: 0,
              borderRadius: presets.radius,
              color: colors.accent,
              fontFamily: options.headerFontFamily.join(`,`),
              fontWeight: `bold`,
              marginRight: rhythm(1.5 / 4),
              padding: `${rhythm(1 / 6)} ${rhythm(2 / 3)}`, // @todo same as site showcase but wrong for some reason
              textDecoration: `none`,
              WebkitFontSmoothing: `antialiased`,
              "&&": {
                backgroundColor: colors.accent,
                borderBottom: `none`,
                boxShadow: `none`,
                color: colors.gatsby,
                "&:hover": {
                  backgroundColor: colors.accent,
                },
              },
            }}
          >
            <MdLaunch
              style={{
                verticalAlign: `sub`,
              }}
            />
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
