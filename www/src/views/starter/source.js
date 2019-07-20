/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { mediaQueries } from "../../utils/presets"
import TechWithIcon from "../../components/tech-with-icon"
import GithubIcon from "react-icons/lib/fa/github"
import { NetlifyIcon } from "../../assets/logos"

const Source = ({ startersYaml, repoUrl }) => (
  <div
    sx={{
      display: `flex`,
      borderTop: t => `1px solid ${t.colors.ui.border.subtle}`,
      fontFamily: `header`,
      mx: 6,
      [mediaQueries.sm]: { borderTop: 0 },
      [mediaQueries.lg]: { mx: 8 },
    }}
  >
    {repoUrl && (
      <div
        csx={{
          padding: 20,
          pl: startersYaml.featured ? false : 0,
          display: `flex`,
          alignItems: `center`,
        }}
      >
        <GithubIcon
          sx={{
            mb: 0,
            mr: 2,
            height: 26,
            width: 20,
            color: `gatsby`,
          }}
        />
        <a
          href={repoUrl}
          sx={{
            "&&": {
              borderBottom: 0,
              color: `gatsby`,
              cursor: `pointer`,
              fontWeight: `normal`,
              "&:hover": {
                color: `lilac`,
              },
            },
          }}
        >
          Source
        </a>
      </div>
    )}
    <div
      sx={{
        display: `none`,
        [mediaQueries.lg]: {
          alignItems: `center`,
          display: `flex`,
          flex: 1,
          justifyContent: `flex-end`,
          p: 20,
          pl: 0,
        },
      }}
    >
      <span
        sx={{
          marginRight: 20,
          color: `text.secondary`,
        }}
      >
        Try this starter
      </span>
      <a
        href={`https://app.netlify.com/start/deploy?repository=${repoUrl}`}
        sx={{
          "&&": {
            borderBottom: 0,
            color: `gatsby`,
            cursor: `pointer`,
            fontWeight: `normal`,
            "&:hover": {
              color: `lilac`,
            },
          },
        }}
      >
        <TechWithIcon icon={NetlifyIcon}>Netlify</TechWithIcon>
      </a>
    </div>
  </div>
)

export default Source
