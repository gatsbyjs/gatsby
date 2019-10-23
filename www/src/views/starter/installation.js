/** @jsx jsx */
import { jsx } from "theme-ui"
import Copy from "../../components/copy"
import { mediaQueries } from "gatsby-design-tokens"

const StarterInstallation = ({ repoName, repoUrl }) => {
  const content = `gatsby new ${repoName || `my-gatsby-project`} ${repoUrl}`
  return (
    <div
      sx={{
        mx: 6,
        [mediaQueries.lg]: {
          mx: 8,
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
          background: `code.bg`,
          p: 0,
        }}
      >
        <code
          sx={{
            alignItems: `center`,
            display: `flex`,
            justifyContent: `space-between`,
            overflowWrap: `break-word`,
            p: 2,
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
            sx={{ borderRadius: 1 }}
          />
        </code>
      </pre>
    </div>
  )
}

export default StarterInstallation
