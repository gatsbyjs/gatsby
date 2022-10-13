/**
 * Filter props passed to page components.
 * This helps avoid React tree mismatch errors when props are different in server and browser contexts.
 */
export function filterPageProps(props) {
  const { location, params, data = {}, pageContext, serverData = {} } = props

  return {
    location: {
      pathname: location.pathname,
    },
    params,
    data,
    pageContext,
    serverData,
  }
}
