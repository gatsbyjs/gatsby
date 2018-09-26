import presets, { colors } from "../../utils/presets"
import { options, scale } from "../../utils/typography"
import sharedStyles from "../shared/styles"
import TechWithIcon from "../../components/tech-with-icon"
import GithubIcon from "react-icons/lib/fa/github"
import { NetlifyIcon } from "../../assets/logos"

const Source = ({ frontmatter, markdownRemark }) => {
  return (
    <div
      className="github-source-playground"
      css={{
        display: `flex`,
        borderTop: `1px solid ${colors.ui.light}`,
        fontFamily: options.headerFontFamily.join(`,`),
        margin: `0 ${sharedStyles.gutter}`,
        [presets.Desktop]: {
          margin: `0 ${sharedStyles.gutterDesktop}`,
        },
      }}
    >
      {frontmatter.repo && (
        <div
          css={{
            padding: 20,
            paddingLeft: markdownRemark.featured ? false : 0,
            display: `flex`,
            [presets.Desktop]: {
              ...scale(-1 / 6),
            },
            alignItems: `center`,
          }}
        >
          <GithubIcon
            css={{
              marginBottom: 0,
              marginRight: 10,
              height: 26,
              width: 20,
              color: colors.gatsby,
            }}
          />
          <a
            href={frontmatter.repo}
            css={{
              "&&": {
                ...scale(1 / 5),
                boxShadow: `none`,
                borderBottom: 0,
                color: colors.gatsby,
                cursor: `pointer`,
                fontFamily: options.headerFontFamily.join(`,`),
                fontWeight: `normal`,
                "&:hover": {
                  background: `transparent`,
                  color: colors.lilac,
                },
              },
            }}
          >
            Source
          </a>
        </div>
      )}

      <div
        css={{
          display: `none`,
          [presets.Desktop]: {
            padding: 20,
            paddingLeft: 0,
            flex: 1,
            justifyContent: `flex-end`,
            display: `flex`,
            borderRight: `1px solid ${colors.ui.light}`,
            ...scale(-1 / 6),
            alignItems: `center`,
          },
        }}
      >
        <span
          css={{
            marginRight: 20,
            color: colors.gray.calm,
            ...scale(1 / 5),
          }}
        >
          Try this starter
        </span>
        <a
          href={`https://app.netlify.com/start/deploy?repository=${
            frontmatter.repo
          }`}
          style={{
            borderBottom: `none`,
            boxShadow: `none`,
            color: colors.gatsby,
            ...scale(1 / 5),
            fontWeight: `normal`,
          }}
        >
          {/* <img
						src="https://www.netlify.com/img/deploy/button.svg"
						alt="Deploy to Netlify"
						css={{ marginBottom: 0 }}
					/> */}
          <TechWithIcon icon={NetlifyIcon}>Netlify</TechWithIcon>
        </a>
      </div>
    </div>
  )
}

export default Source
