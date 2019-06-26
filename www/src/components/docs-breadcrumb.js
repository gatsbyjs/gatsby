import React from "react"
import styled from "@emotion/styled"
import { Link } from "gatsby"
import getActiveItem from "../utils/sidebar/get-active-item"
import getActiveItemParents from "../utils/sidebar/get-active-item-parents"
import { mediaQueries, space, colors, fontSizes } from "../utils/presets"
import { rhythm } from "../utils/typography"

const BreadcrumbLink = styled(Link)`
  && {
    border-bottom: none;
  }
  &:hover {
    color: ${colors.link.hoverBorder};
  }
`

const Separator = ({ character = `>` }) => (
  <span style={{ margin: `0px ${space[1]}` }} role="presentation">
    {character}
  </span>
)

const BreadcrumbNav = ({ children, mobile = false }) => (
  <nav
    aria-label="breadcrumb"
    css={{
      fontSize: fontSizes[1],
      display: `${mobile ? `inherit` : `none`}`,
      [mediaQueries.md]: {
        display: `${mobile ? `none` : `inherit`}`,
      },
      marginBottom: rhythm(1 / 2),
    }}
  >
    {children}
  </nav>
)

const Breadcrumb = ({ itemList, location }) => {
  const activeItem = getActiveItem(itemList.items, location, undefined)
  const activeItemParents = getActiveItemParents(itemList.items, activeItem, [])

  // return a shorter version of the breadcrumb on the intro page
  // because the docs intro page isn't generated from markdown
  if (activeItem.title === `Introduction`) {
    return (
      <>
        {/* only the breadcrumb nav of the proper viewport is displayed */}
        <BreadcrumbNav>
          <BreadcrumbLink to="/">Home</BreadcrumbLink>
          <Separator />
          Docs
        </BreadcrumbNav>
        <BreadcrumbNav mobile>
          <Separator character="<" />
          <BreadcrumbLink to="/">Home</BreadcrumbLink>
        </BreadcrumbNav>
      </>
    )
  }

  return (
    <>
      <BreadcrumbNav>
        <BreadcrumbLink to="/">Home</BreadcrumbLink>
        <Separator />
        <BreadcrumbLink to="/docs/">Docs</BreadcrumbLink>
        <Separator />
        {activeItemParents.reverse().map(item => (
          <React.Fragment key={item.title}>
            <span>
              <BreadcrumbLink to={item.link}>{item.title}</BreadcrumbLink>
            </span>
            <Separator />
          </React.Fragment>
        ))}
        {activeItem.title}
      </BreadcrumbNav>
      {activeItemParents && (
        <BreadcrumbNav mobile>
          <Separator character="<" />
          <BreadcrumbLink
            to={
              activeItemParents[activeItemParents.length - 1]
                ? activeItemParents[activeItemParents.length - 1].link
                : `/docs/`
            }
          >
            {activeItemParents[activeItemParents.length - 1]
              ? activeItemParents[activeItemParents.length - 1].title
              : `Docs`}
          </BreadcrumbLink>
        </BreadcrumbNav>
      )}
    </>
  )
}

export default Breadcrumb
