/** @jsx jsx */
import { jsx } from "theme-ui"
import { OutboundLink } from "gatsby-plugin-google-analytics"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const InnerContainer = ({ children }) => (
  <div
    sx={{
      display: `flex`,
      alignItems: `center`,
      justifyContent: `center`,
      height: `100%`,
      overflowX: `auto`,
      maskImage: t =>
        `linear-gradient(to right, transparent, ${t.colors.purple[`90`]} ${
          t.space[`6`]
        }, ${t.colors.purple[`90`]} 96%, transparent)`,
      [mediaQueries.md]: {
        justifyContent: `flex-start`,
      },
    }}
  >
    {children}
  </div>
)

const Content = ({ children }) => (
  <div
    sx={{
      color: `whiteFade.80`,
      fontFamily: `heading`,
      px: 6,
      whiteSpace: `nowrap`,
      a: {
        color: `white`,
        borderBottom: t => `1px solid ${t.colors.white}`,
        "&:hover": {
          borderBottom: 0,
        },
      },
    }}
  >
    {children}
  </div>
)

export default function Banner() {
  return (
    <aside
      className="banner"
      sx={{
        position: `fixed`,
        zIndex: `banner`,
        backgroundColor: `banner`,
        height: `bannerHeight`,
        width: `100%`,
        px: `env(safe-area-inset-left)`,
      }}
    >
      <InnerContainer>
        <Content>
          {`New! Try Incremental Builds with `}
          <OutboundLink href="https://www.gatsbyjs.com">
            Gatsby Cloud!
          </OutboundLink>
        </Content>
      </InnerContainer>
    </aside>
  )
}
