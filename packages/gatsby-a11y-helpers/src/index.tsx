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
  return (
    <div
      {...props}
      data-gatsby-route-announcement={true}
      data-gatsby-route-announcement-use-title={useTitle}
      style={{
        position: visuallyHidden ? `absolute` : `inherit`,
        top: visuallyHidden ? `0` : `inherit`,
        width: visuallyHidden ? `1` : `inherit`,
        height: visuallyHidden ? `1` : `inherit`,
        padding: visuallyHidden ? `0` : `inherit`,
        overflow: visuallyHidden ? `hidden` : `inherit`,
        clip: visuallyHidden ? `rect(0, 0, 0, 0)` : `inherit`,
        whiteSpace: visuallyHidden ? `nowrap` : `inherit`,
        border: visuallyHidden ? `0` : `inherit`,
      }}
    >
      {children}
    </div>
  )
}

export type RouteAnnouncementProps = {
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
}) => {
  //verify that children is interactive
  return (
    <div {...props} data-gatsby-csr-focus={true}>
      {children}
    </div>
  )
}

export type RouteFocusProps = {
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
