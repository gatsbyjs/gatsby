/** @jsx jsx */
import { jsx } from "theme-ui"
import { OutboundLink } from "gatsby-plugin-google-analytics"

function BannerContent() {
  return (
    <div
      sx={{
        color: `whiteFade.80`,
        fontFamily: `heading`,
        px: 6,
        whiteSpace: `nowrap`,
      }}
    >
      {`New! Try Incremental Builds with `}
      <OutboundLink
        href="https://www.gatsbyjs.com"
        sx={{
          color: `white`,
          borderBottom: 1,
          borderColor: `white`,
          "&:hover": {
            borderBottom: 0,
          },
        }}
      >
        Gatsby Cloud!
      </OutboundLink>
    </div>
  )
}

const innerContainerStyles = {
  display: `flex`,
  alignItems: `center`,
  justifyContent: [`center`, null, `flex-start`],
  height: `100%`,
  overflowX: `auto`,
  maskImage: t =>
    `linear-gradient(to right, transparent, ${t.colors.purple[`90`]} ${
      t.space[`6`]
    }, ${t.colors.purple[`90`]} 96%, transparent)`,
}

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
      <div sx={innerContainerStyles}>
        <BannerContent />
      </div>
    </aside>
  )
}
