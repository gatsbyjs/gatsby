import React from "react"
import Link from "gatsby-link"
import gray from "gray-percentage"

import typography, { rhythm, scale, options } from "../utils/typography"
import presets from "../utils/presets"

const accentColor = presets.brand
const listStyles = {
  listStyle: `none`,
  margin: 0,
  padding: 0,
  fontFamily: typography.options.headerFontFamily.join(`,`),
  "& li": {
    marginBottom: options.blockMarginBottom / 2,
    lineHeight: 1.3,
    paddingTop: rhythm(1 / 8),
    paddingBottom: rhythm(1 / 8),
    "& .nav-link": {
      position: `relative`,
      "&:before": {
        content: ` `,
        height: 4,
        width: 4,
        borderRadius: `100%`,
        top: `.5em`,
        left: `-.7em`,
        fontWeight: `normal`,
        position: `absolute`,
        transform: `scale(0.1)`,
        transition: `all ${presets.animation.speedDefault} ${presets.animation
          .curveDefault}`,
        [presets.Hd]: {
          height: 6,
          width: 6,
          marginTop: -3,
          left: `-1em`,
        },
      },
    },
    "& .nav-link-active": {
      opacity: 1,
      color: accentColor,
      fontWeight: `600`,
      "&:before": {
        background: accentColor,
        transform: `scale(1)`,
      },
    },
  },
}

const Section = props => (
  <div>
    <h3
      css={{
        ...props.headerStyles,
        marginTop: props.index === 0 ? 0 : rhythm(3 / 2),
      }}
    >
      {props.title}
    </h3>
    <SectionLinks
      {...props}
      title={props.title}
      isTutorial={props.title === `Tutorial`}
    />
  </div>
)

const SectionLinks = props => {
  const tutorialStyles = props.isTutorial
    ? {
        "&&": {
          "& > li": {
            marginBottom: `1rem`,
            "& > .nav-link": {
              fontWeight: `bold`,
            },
          },
        },
      }
    : false

  return (
    <ul
      css={{
        ...listStyles,
        "& ul": {
          ...listStyles,
        },
        ...tutorialStyles,
      }}
    >
      {props.items.map((item, index) => (
        <SectionLink
          node={item}
          children={item.items}
          key={index}
          isInline={props.isInline}
        />
      ))}
    </ul>
  )
}

const SectionLink = props => {
  // Don't show the main docs link on mobile as we put these
  // links on that main docs page so it's confusing to have
  // the page link to itself.
  if (props.isInline && props.node.link === `/docs/`) {
    return null
  }

  let childnodes = null
  if (props.children) {
    childnodes = props.children.map((childnode, index) => (
      <SectionLink key={index} node={childnode} children={childnode.items} />
    ))
  }

  const item = props.node

  // If the last character is a * then the doc page is still in draft
  const isDraft = item.title.slice(-1) === `*`
  const title = isDraft ? item.title.slice(0, -1) : item.title
  const linkStyle = {
    "&&": {
      "& .nav-link": {
        borderBottom: `none`,
        boxShadow: `none`,
        color: isDraft ? gray(50, 270) : gray(30, 270),
        fontWeight: `normal`,
        fontStyle: isDraft ? `italic` : false,
      },
      "& .nav-link-active": {
        color: accentColor,
        fontWeight: `bold`,
        fontStyle: isDraft ? `italic` : false,
      },
    },
  }

  return (
    <li key={item.title} css={linkStyle}>
      {item.link.charAt(0) == `#` ? (
        <a href={item.link} className="nav-link">
          {title}
        </a>
      ) : (
        <Link
          to={item.link}
          activeClassName="nav-link-active"
          className="nav-link"
          exact
        >
          {title}
        </Link>
      )}
      {childnodes ? <ul>{childnodes}</ul> : null}
    </li>
  )
}

class SidebarBody extends React.Component {
  render() {
    const menu = this.props.yaml
    const isInline = this.props.inline

    // Use original sizes on mobile as the text is inline
    // but smaller on > tablet so as not to compete with body text.
    const fontSize = isInline ? scale(0).fontSize : scale(-2 / 10).fontSize
    const headerStyles = isInline
      ? {
          fontSize: scale(2 / 5).fontSize,
        }
      : {
          fontSize: scale(-2 / 5).fontSize,
          color: presets.brandLight,
          textTransform: `uppercase`,
          letterSpacing: `.15em`,
          fontWeight: `normal`,
        }

    return (
      <div
        css={{
          padding: isInline ? 0 : rhythm(3 / 4),
        }}
      >
        {menu.map((section, index) => (
          <div
            key={index}
            css={{
              fontSize,
            }}
          >
            <Section
              {...section}
              title={section.title}
              headerStyles={headerStyles}
              index={index}
              isInline={isInline}
            />
          </div>
        ))}
      </div>
    )
  }
}

export default SidebarBody
