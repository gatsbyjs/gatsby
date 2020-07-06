import React from "react";

/**
 * Announce
 *
 * Renders a wrapping div around content to announce on client side route change
 *
 */
export const RouteAnnouncement: React.FC<RouteAnnouncementProps> = ({
  children,
  ...props
}) => {
  // TODO: adapt visually hidden in useEffect ?
  return (
    <div
      {...props}
      data-gatsby-route-announcement={true}
    >
      {children}
    </div>
  );
};

export type RouteAnnouncementProps = {
  children: React.ReactNode;
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
  // TODO: adapt visually hidden in useEffect ?
  return (
    <div
      {...props}
      data-gatsby-csr-focus={true}
    >
      {children}
    </div>
  );
};

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
  children: React.ReactNode;
};