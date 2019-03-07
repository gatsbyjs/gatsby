import React from "react"
import presets, { colors, space } from "../../utils/presets"
import { rhythm, options } from "../../utils/typography"
import ShareMenu from "../../components/share-menu"
import MdLink from "react-icons/lib/md/link"
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
      padding: rhythm(space[6]),
      paddingTop: 0,
      [presets.Sm]: {
        flexDirection: `row`,
        flexWrap: `nowrap`,
        paddingBottom: 0,
      },
      [presets.Lg]: {
        padding: rhythm(space[8]),
        paddingTop: 0,
        paddingBottom: 0,
      },
    }}
  >
    <div
      css={{
        marginTop: rhythm(space[6]),
        paddingRight: 15,
        display: `flex`,
        flexWrap: `wrap`,
        justifyContent: `space-between`,
        flexShrink: 0,
        [presets.Sm]: {
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
        marginTop: rhythm(space[6]),
        marginRight: 15,
        display: `flex`,
        flexWrap: `nowrap`,
        flexGrow: 1,
        borderBottom: `1px solid ${colors.ui.light}`,
        paddingBottom: rhythm(2 / 4),
        [presets.Sm]: {
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
            right: rhythm(space[6]),
            top: rhythm(0),
            left: `auto`,
            zIndex: 1,
            display: `flex`,
          }}
        >
          <a
            href={demo}
            css={{
              border: 0,
              borderRadius: presets.radii[1],
              color: colors.accent,
              fontFamily: options.headerFontFamily.join(`,`),
              fontWeight: `bold`,
              marginRight: rhythm(1.5 / 4),
              padding: `${rhythm(space[1])} ${rhythm(presets.space[4])}`, // @todo same as site showcase but wrong for some reason
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
            <MdLink
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
