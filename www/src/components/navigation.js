/** @jsx jsx */
import { jsx } from "theme-ui"
import { useColorMode } from "theme-ui"

import React from "react"
import { Link } from "gatsby"
import GithubIcon from "react-icons/lib/go/mark-github"
import TwitterIcon from "react-icons/lib/fa/twitter"
import MdBrightness1 from "react-icons/lib/md/brightness-low"
import MdBrightness2 from "react-icons/lib/md/brightness-high"
import SearchForm from "../components/search-form"
import DiscordIcon from "../components/discord"
import logo from "../logo.svg"
import logoInverted from "../logo-inverted.svg"
import { colors, mediaQueries } from "../utils/presets"
import { breakpointGutter } from "../utils/styles"

// what we need to nudge down the navItems to sit
// on the baseline of the logo's wordmark
const navItemTopOffset = `0.4rem`
// theme-ui values
const navItemHorizontalSpacing = 2
const iconColor = `lilac`

const navItemStyles = {
  borderBottom: `2px solid transparent`,
  color: `navigation.linkDefault`,
  display: `block`,
  fontSize: 3,
  lineHeight: t => `calc(${t.sizes.headerHeight} - ${navItemTopOffset})`,
  position: `relative`,
  textDecoration: `none`,
  top: 0,
  WebkitFontSmoothing: `antialiased`,
  zIndex: 1,
  "&:hover": { color: `gatsby` },
}

const assignActiveStyles = ({ isPartiallyCurrent }) =>
  isPartiallyCurrent
    ? {
        style: {
          borderBottomColor: colors.lilac,
          color: colors.lilac,
        },
      }
    : {}

const NavItem = ({ linkTo, children }) => (
  <li
    sx={{
      display: `block`,
      m: 0,
      mx: navItemHorizontalSpacing,
    }}
  >
    <Link to={linkTo} getProps={assignActiveStyles} sx={navItemStyles}>
      {children}
    </Link>
  </li>
)

const SocialNavItem = ({ href, title, children }) => (
  <a
    href={href}
    title={title}
    sx={{
      ...navItemStyles,
      color: iconColor,
      fontSize: 2,
      px: navItemHorizontalSpacing,
    }}
  >
    {children}
  </a>
)

const Navigation = ({ pathname }) => {
  const [colorMode, setColorMode] = useColorMode()
  const isHomepage = pathname === `/`

  return (
    <header
      sx={{
        bg: `navigation.background`,
        height: `headerHeight`,
        left: 0,
        px: `env(safe-area-inset-left)`,
        position: `relative`,
        right: 0,
        top: t => t.sizes.bannerHeight,
        zIndex: `navigation`,
        // use this to test if the header items are properly aligned to the logo
        // wordmark
        // "&:before": {
        //   content: `''`,
        //   position: `absolute`,
        //   bottom: `1.25rem`,
        //   left: 0,
        //   right: 0,
        //   width: `100%`,
        //   height: 1,
        //   zIndex: 10,
        //   background: `red`,
        // },
        [breakpointGutter]: {
          position: isHomepage ? `absolute` : `fixed`,
        },
      }}
    >
      <div
        sx={{
          alignItems: `center`,
          display: `flex`,
          fontFamily: `header`,
          height: `100%`,
          margin: `0 auto`,
          px: 6,
          position: `relative`,
          width: `100%`,
          "&:after": {
            bg: isHomepage ? `transparent` : `ui.border.subtle`,
            bottom: 0,
            content: `''`,
            height: 1,
            left: 0,
            position: `absolute`,
            right: 0,
            zIndex: -1,
          },
        }}
      >
        <Link
          to="/"
          sx={{
            alignItems: `center`,
            color: `inherit`,
            display: `flex`,
            flexShrink: 0,
            mr: 3,
            textDecoration: `none`,
          }}
          aria-label="Gatsby, Back to homepage"
        >
          <img
            src={colorMode === `light` ? logo : logoInverted}
            sx={{
              height: `logo`,
              m: 0,
            }}
            alt="Gatsby Logo"
            aria-hidden="true"
          />
        </Link>
        <nav
          className="navigation"
          aria-label="Primary Navigation"
          sx={{
            display: `none`,
            [mediaQueries.md]: {
              alignSelf: `flex-end`,
              display: `flex`,
              ml: 6,
            },
          }}
        >
          <ul
            sx={{
              display: `none`,
              [mediaQueries.md]: {
                alignSelf: `flex-end`,
                display: `flex`,
                flexGrow: 1,
                m: 0,
                listStyle: `none`,
                maskImage: t =>
                  `linear-gradient(to right, transparent, white ${
                    t.space[1]
                  }, white 98%, transparent)`,
                overflowX: `auto`,
              },
            }}
          >
            <NavItem linkTo="/docs/">Docs</NavItem>
            <NavItem linkTo="/tutorial/">Tutorials</NavItem>
            <NavItem linkTo="/plugins/">Plugins</NavItem>
            <NavItem linkTo="/features/">Features</NavItem>
            <NavItem linkTo="/blog/">Blog</NavItem>
            <NavItem linkTo="/showcase/">Showcase</NavItem>
            <NavItem linkTo="/contributing/">Contributing</NavItem>
          </ul>
        </nav>
        <div
          sx={{
            alignSelf: `flex-end`,
            display: `flex`,
            ml: `auto`,
          }}
        >
          <SearchForm key="SearchForm" offsetVertical="-0.2175rem" />
          <SocialNavItem
            href="https://github.com/gatsbyjs/gatsby"
            title="GitHub"
          >
            <GithubIcon style={{ verticalAlign: `text-top` }} />
          </SocialNavItem>
          <div
            sx={{
              display: `none`,
              [mediaQueries.lg]: { display: `flex` },
            }}
          >
            <SocialNavItem href="https://gatsby.dev/discord" title="Discord">
              <DiscordIcon overrideCSS={{ verticalAlign: `text-top` }} />
            </SocialNavItem>
            <SocialNavItem href="https://twitter.com/gatsbyjs" title="Twitter">
              <TwitterIcon style={{ verticalAlign: `text-top` }} />
            </SocialNavItem>
          </div>
          <button
            sx={{
              background: `transparent`,
              border: 0,
              color: `navigation.linkDefault`,
            }}
            onClick={e => {
              setColorMode(colorMode === `light` ? `dark` : `light`)
            }}
          >
            {colorMode === `light` ? (
              <MdBrightness2 style={{ verticalAlign: `text-top` }} />
            ) : (
              <MdBrightness1 style={{ verticalAlign: `text-top` }} />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navigation
