/** @jsx jsx */
import { jsx } from "theme-ui"
import { useColorMode } from "theme-ui"
import { Link } from "gatsby"
import GithubIcon from "react-icons/lib/go/mark-github"
import TwitterIcon from "react-icons/lib/fa/twitter"

import SearchForm from "../components/search-form"
import DiscordIcon from "../components/discord"
import logo from "../assets/logo.svg"
import logoInverted from "../assets/logo-inverted.svg"
import { mediaQueries } from "../gatsby-plugin-theme-ui"
import { breakpointGutter } from "../utils/styles"
import DarkModeToggle from "../components/dark-mode-toggle"

// what we need to nudge down the navItems to sit
// on the baseline of the logo's wordmark
const navItemTopOffset = `0.4rem`
// theme-ui values
const navItemHorizontalSpacing = [1, null, 2]

const overrideDefaultMdLineHeight = {
  [mediaQueries.md]: {
    lineHeight: t => t.sizes.headerHeight,
  },
}

const navItemStyles = {
  borderBottom: `2px solid transparent`,
  color: `navigation.linkDefault`,
  display: `block`,
  fontSize: 3,
  lineHeight: t => t.sizes.headerHeight,
  [mediaQueries.md]: {
    lineHeight: t => `calc(${t.sizes.headerHeight} - ${navItemTopOffset})`,
  },
  position: `relative`,
  textDecoration: `none`,
  zIndex: 1,
  "&:hover, &:focus": { color: `navigation.linkHover` },
}

const NavItem = ({ linkTo, children }) => (
  <li
    sx={{
      display: `block`,
      m: 0,
      mx: navItemHorizontalSpacing,
    }}
  >
    <Link
      to={linkTo}
      activeClassName="active"
      partiallyActive={true}
      sx={{
        ...navItemStyles,
        "&.active": {
          borderBottomColor: `lilac`,
          color: `navigation.linkActive`,
        },
      }}
    >
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
      ...overrideDefaultMdLineHeight,
      color: `navigation.socialLink`,
      px: navItemHorizontalSpacing,
    }}
  >
    {children}
  </a>
)

const Navigation = ({ pathname }) => {
  const [colorMode] = useColorMode()
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
        //   bottom: `1.5rem`,
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
            bg: isHomepage ? `transparent` : `ui.border`,
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
            height: `logo`,
            mr: [1, null, 3],
            textDecoration: `none`,
            /* chop logo down to just the monogram for small screens */
            width: [`24px`, null, `auto`],
            overflow: [`hidden`, null, `visible`],
          }}
          aria-label="Gatsby, Back to homepage"
        >
          <img
            src={colorMode === `light` ? logo : logoInverted}
            sx={{
              height: `logo`,
              width: `auto`,
              maxWidth: `none`,
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
              flexGrow: 1,
              flexShrink: 1,
              m: 0,
              minWidth: 0,
              mr: `auto`,
            },
          }}
        >
          <ul
            sx={{
              display: `none`,
              [mediaQueries.md]: {
                alignSelf: `flex-end`,
                display: `flex`,
                listStyle: `none`,
                m: 0,
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
            {/* <NavItem linkTo="/starters/">Starters</NavItem> */}
          </ul>
        </nav>
        <SearchForm key="SearchForm" offsetVertical={navItemTopOffset} />
        <div
          sx={{
            alignSelf: `flex-end`,
            display: `flex`,
          }}
        >
          <SocialNavItem
            href="https://github.com/gatsbyjs/gatsby"
            title="GitHub"
          >
            <GithubIcon style={{ verticalAlign: `middle` }} />
          </SocialNavItem>
          <div
            sx={{
              display: `none`,
              [mediaQueries.xl]: { display: `flex` },
            }}
          >
            <SocialNavItem href="https://twitter.com/gatsbyjs" title="Twitter">
              <TwitterIcon style={{ verticalAlign: `middle` }} />
            </SocialNavItem>
            <SocialNavItem href="https://gatsby.dev/discord" title="Discord">
              <DiscordIcon
                overrideCSS={{
                  verticalAlign: `middle`,
                  position: `relative`,
                  top: `0.05em`,
                }}
              />
            </SocialNavItem>
          </div>
          <div
            sx={{
              ...navItemStyles,
              ...overrideDefaultMdLineHeight,
              color: `navigation.socialLink`,
              ml: navItemHorizontalSpacing,
              "&:hover": {
                color: `navigation.linkHover`,
              },
            }}
          >
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navigation
