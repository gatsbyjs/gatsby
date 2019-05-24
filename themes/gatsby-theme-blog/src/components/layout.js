import React from "react"
import { Link } from "gatsby"
import { useColorMode } from "theme-ui"
import Toggle from "./toggle"

import sun from "../../content/assets/sun.png"
import moon from "../../content/assets/moon.png"

const Header = props => {
  const { location, title } = props
  const rootPath = `${__PATH_PREFIX__}/`

  if (location.pathname === rootPath) {
    return (
      <h1
        style={{
          // ...scale(0.75),
          marginBottom: 0,
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `var(--textTitle)`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h1>
    )
  } else {
    return (
      <h3
        style={{
          fontFamily: `Montserrat, sans-serif`,
          marginTop: 0,
          marginBottom: 0,
          height: 42, // because
          lineHeight: `2.625rem`,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `rgb(102, 185, 191)`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h3>
    )
  }
}

const Layout = props => {
  const { children } = props
  const [colorMode, setColorMode] = useColorMode()
  const isDark = colorMode === `dark`
  const toggleColorMode = e => {
    setColorMode(isDark ? `light` : `dark`)
  }

  return (
    <div
      style={{
        color: `var(--textNormal)`,
        background: `var(--bg)`,
        transition: `color 0.2s ease-out, background 0.2s ease-out`,
        minHeight: `100vh`,
      }}
    >
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          // maxWidth: rhythm(24),
          // padding: `2.625rem ${rhythm(3 / 4)}`
        }}
      >
        <header
          style={{
            display: `flex`,
            justifyContent: `space-between`,
            alignItems: `center`,
            marginBottom: `2.625rem`,
          }}
        >
          <Header {...props} />
          <Toggle
            icons={{
              checked: (
                <img
                  alt="moon indicating dark mode"
                  src={moon}
                  width="16"
                  height="16"
                  role="presentation"
                  style={{ pointerEvents: `none` }}
                />
              ),
              unchecked: (
                <img
                  alt="sun indicating light mode"
                  src={sun}
                  width="16"
                  height="16"
                  role="presentation"
                  style={{ pointerEvents: `none` }}
                />
              ),
            }}
            checked={isDark}
            onChange={toggleColorMode}
          />
        </header>
        {children}
      </div>
    </div>
  )
}

export default Layout
