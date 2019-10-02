import React from "react"
import Copy from "../../components/copy"
import { radii, mediaQueries } from "gatsby-design-tokens"

const StarterInstallation = ({ repoName, repoUrl }) => {
  const content = `gatsby new ${repoName || `my-gatsby-project`} ${repoUrl}`
  return (
    <div
      sx={{
        px: 6,
        py: 0,
        [mediaQueries.lg]: {
          px: 8,
          display: `grid`,
          gridTemplateRows: `auto auto`,
          gridRowGap: 2,
        },
      }}
    >
      <div sx={{ fontSize: 1, color: `textMuted` }}>
        Install this starter locally:
      </div>
      <pre
        sx={{
          p: 0,
          background: `code.bg`,
        }}
      >
        <code
          sx={{
            display: `flex`,
            alignItems: `center`,
            justifyContent: `space-between`,
            p: 2,
            overflowWrap: `break-word`,
            [mediaQueries.lg]: {
              p: 3,
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
