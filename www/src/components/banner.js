/** @jsx jsx */
import { jsx } from "theme-ui"
import styled from "@emotion/styled"
import { OutboundLink } from "gatsby-plugin-google-analytics"

const InnerContainer = styled(`div`)`
  align-items: center;
  // justify-content: center;
  display: flex;
  height: ${p => p.theme.sizes.bannerHeight};
  overflow-x: auto;
  mask-image: ${p =>
    `linear-gradient(to right, transparent, ${
      p.theme.colors.banner.background
    } ${p.theme.space[6]}, ${
      p.theme.colors.banner.background
    } 96%, transparent)`};
`

const Content = styled(`div`)`
  color: ${p => p.theme.colors.banner.color};
  // font-family: ${p => p.theme.fonts.heading};
  font-size: ${p => p.theme.fontSizes[1]};
  padding-left: ${p => p.theme.space[6]};
  padding-right: ${p => p.theme.space[6]};
  white-space: nowrap;

  a {
    color: ${p => p.theme.colors.white};
    border-bottom: 1px solid ${p => p.theme.colors.white};
  }

  a:hover {
    color: ${p => p.theme.colors.white};
    border-bottom-color: ${p => p.theme.colors.white}a0;
  }
`

const Banner = () => (
  <aside
    className="banner"
    sx={{
      bg: `banner.background`,
      height: `bannerHeight`,
      position: `fixed`,
      width: `100%`,
      zIndex: `banner`,
      px: `env(safe-area-inset-left)`,
    }}
  >
    <InnerContainer>
      <Content>
        {`Using Gatsby for your clients or team? Start 14-day free trial of `}
        <OutboundLink href="https://www.gatsbyjs.com/preview">
          Gatsby Preview
        </OutboundLink>
      </Content>
    </InnerContainer>
  </aside>
)

export default Banner
