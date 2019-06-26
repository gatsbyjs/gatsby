import React from "react"
import { Link } from "gatsby"
import getActiveItem from "../utils/sidebar/get-active-item"
import getActiveItemParents from "../utils/sidebar/get-active-item-parents"
import { mediaQueries } from "../utils/presets"

const Separator = ({ character = `>` }) => (
  <span style={{ margin: `0px 5px` }} role="presentation">
    {character}
  </span>
)

const BreadcrumbNav = ({ children }) => (
  <nav
    aria-label="breadcrumb"
    css={{
      display: `none`,
      [mediaQueries.md]: {
        display: `inherit`,
      },
    }}
  >
    {children}
  </nav>
)

const MobileBreadcrumbNav = ({ children }) => (
  <nav
    aria-label="breadcrumb"
    css={{
      [mediaQueries.md]: {
        display: `none`,
      },
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
          <Link to="/">Home</Link>
          <Separator />
          Docs
        </BreadcrumbNav>
        <MobileBreadcrumbNav>
          <Separator character="<" />
          <Link to="/">Home</Link>
        </MobileBreadcrumbNav>
      </>
    )
  } else {
    return (
      <>
        <BreadcrumbNav>
          <Link to="/">Home</Link>
          <Separator />
          <Link to="/docs/">Docs</Link>
          <Separator />
          {activeItemParents.reverse().map(item => (
            <React.Fragment key={item.title}>
              <span>
                <Link to={item.link}>{item.title}</Link>
              </span>
              <Separator />
            </React.Fragment>
          ))}
          {activeItem.title}
        </BreadcrumbNav>
        {activeItemParents && (
          <MobileBreadcrumbNav>
            <Separator character="<" />
            <Link
              to={
                activeItemParents[activeItemParents.length - 1]
                  ? activeItemParents[activeItemParents.length - 1].link
                  : `/docs/`
              }
            >
              {activeItemParents[activeItemParents.length - 1]
                ? activeItemParents[activeItemParents.length - 1].title
                : `Docs`}
            </Link>
          </MobileBreadcrumbNav>
        )}
      </>
    )
  }
}

export default Breadcrumb
