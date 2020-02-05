/** @jsx jsx */
import { jsx } from "theme-ui"
import { mediaQueries } from "../../gatsby-plugin-theme-ui"
import TechWithIcon from "../../components/tech-with-icon"
import GithubIcon from "react-icons/lib/fa/github"
import CodesandboxIcon from "../../assets/vendor-logos/codesandbox.svg"
import NetlifyIcon from "../../assets/vendor-logos/netlify.svg"

const Source = ({ startersYaml, repoUrl, starter }) => (
  <div
    sx={{
      display: `flex`,
      borderTop: t => `1px solid ${t.colors.ui.border}`,
      fontFamily: `header`,
      mx: 6,
      [mediaQueries.sm]: { borderTop: 0 },
      [mediaQueries.lg]: { mx: 8 },
    }}
  >
    {repoUrl && (
      <a
        href={repoUrl}
        sx={{
          alignItems: `center`,
          display: `flex`,
          lineHeight: `solid`,
          p: 4,
          pl: startersYaml.featured ? false : 0,
          "&&": {
            borderBottom: 0,
            color: `link.color`,
            cursor: `pointer`,
            fontWeight: `body`,
            "&:hover": {
              color: `link.hoverColor`,
            },
          },
        }}
      >
        <GithubIcon
          sx={{
            mb: 0,
            mr: 2,
          }}
        />
        Source
      </a>
    )}
    <div
      sx={{
        display: `none`,
        [mediaQueries.lg]: {
          alignItems: `center`,
          display: `flex`,
          flex: 1,
          justifyContent: `flex-end`,
          p: 4,
          pl: 0,
        },
      }}
    >
      <span
        sx={{
          color: `textMuted`,
          mr: 4,
        }}
      >
        Try this starter
      </span>
      <a
        href={`https://codesandbox.io/s/github/${starter.owner}/${starter.stub}`}
        sx={{
          "&&": {
            borderBottom: 0,
            marginRight: t => t.space[4]
          },
        }}
      >
        <TechWithIcon icon={CodesandboxIcon}>CodeSandbox</TechWithIcon>
      </a> &nbsp; 
      <a
        href={`https://app.netlify.com/start/deploy?repository=${repoUrl}`}
        sx={{
          "&&": {
            borderBottom: 0,
          },
        }}
      >
        <TechWithIcon icon={NetlifyIcon}>Netlify</TechWithIcon>
      </a>
    </div>
  </div>
)

export default Source
