import React from "react"
import Copy from "../../components/copy"
import {
  colors,
  space,
  radii,
  mediaQueries,
  fontSizes,
} from "../../utils/presets"

const StarterInstallation = ({ repoName, repoUrl }) => {
  const content = `gatsby new ${repoName || `my-gatsby-project`} ${repoUrl}`
  return (
    <div
      css={{
        padding: `0px ${space[6]}`,
        [mediaQueries.lg]: {
          padding: `0px ${space[8]}`,
          display: `grid`,
          gridTemplateRows: `auto auto`,
          gridRowGap: space[2],
        },
      }}
    >
      <div css={{ fontSize: fontSizes[1], color: colors.text.secondary }}>
        Install this starter locally:
      </div>
      <pre
        css={{
          padding: 0,
          background: colors.code.bg,
        }}
      >
        <code
          css={{
            display: `flex`,
            alignItems: `center`,
            justifyContent: `space-between`,
            padding: space[2],
            overflowWrap: `break-word`,
            [mediaQueries.lg]: {
              padding: space[3],
            },
            "&:before": {
              display: `none`,
            },
            "&:after": {
              display: `none`,
            },
          }}
        >
          {content}
          <Copy
            fileName="Install command"
            content={content}
            css={{ borderRadius: `${radii[1]}px` }}
          />
        </code>
      </pre>
    </div>
  )
}

export default StarterInstallation
