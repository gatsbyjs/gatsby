import React from "react"

/**
 * Announce
 *
 * Renders a wrapping div around content to announce on client side route change
 *
 */
export const RouteAnnouncement: React.FC<RouteAnnouncementProps> = ({
  children,
  visuallyHidden = false,
  useTitle = false,
  ...props
}) => {
  const hiddenStyle: React.CSSProperties = {
    position: `absolute`,
    top: `0`,
    width: `1`,
    height: `1`,
    padding: `0`,
    overflow: `hidden`,
    clip: `rect(0, 0, 0, 0)`,
    whiteSpace: `nowrap`,
    border: `0`,
  }

  const initialStyle: React.CSSProperties = {}

  return (
    <div
      {...props}
      data-gatsby-route-announcement={true}
      data-gatsby-route-announcement-use-title={useTitle}
      style={visuallyHidden ? hiddenStyle : initialStyle}
    >
      {children}
    </div>
  )
}

export interface RouteAnnouncementProps {
  children: React.ReactNode
  visuallyHidden?: boolean
  useTitle?: boolean
}

////////////////////////////////////////////////////////////////////////////////

/**
 * RouteFocus
 *
 * Renders a div that should wrap a small, interactive element (ideally a skip link)
 * placed at the top of the page that Gatsby will detect and send focus to on
 * client side route changes
 */
export const RouteFocus: React.FC<RouteFocusProps> = ({
  children,
  ...props
}) => (
  //verify that children is interactive
  <div {...props} data-gatsby-csr-focus={true}>
    {children}
  </div>
)

export interface RouteFocusProps {
  /**
   * The `RouteFocus` element should wrap a small, interactive element (ideally a skip link)
   * placed at the top of the page
   *
   * Keep in mind it renders a `div`, so it may mess with your CSS depending on
   * where it’s placed.
   *
   * @example
   *   <RouteFocus>
   *     <SkipLink/>
   *   </RouteFocus>
   */
  children: React.ReactNode
}
