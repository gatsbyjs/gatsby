/** @jsx jsx */
import { jsx } from "theme-ui"
import { OutboundLink } from "gatsby-plugin-google-analytics"

const contentStyles = {
  color: `whiteFade.80`,
  fontFamily: `heading`,
  whiteSpace: `nowrap`,
  px: 6,
}

const linkStyles = {
  color: `white`,
  borderBottom: 1,
  borderColor: `ui.border`,
  "&:hover": {
    borderBottom: 0,
  },
}

const outerContainerStyles = {
  position: `fixed`,
  zIndex: `banner`,
  backgroundColor: `banner`,
  height: `bannerHeight`,
  width: `100%`,
  px: `env(safe-area-inset-left)`,
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

const BannerContent = () => (
  <div sx={contentStyles}>
    {`New! Try Incremental Builds with `}
    <OutboundLink href="https://www.gatsbyjs.com" sx={linkStyles}>
      Gatsby Cloud!
    </OutboundLink>
  </div>
)

export default function Banner() {
  return (
    <aside sx={outerContainerStyles}>
      <div sx={innerContainerStyles}>
        <BannerContent />
      </div>
    </aside>
  )
}
