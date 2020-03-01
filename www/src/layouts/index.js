/** @jsx jsx */
import { jsx } from "theme-ui"
import BaseLayout from "../components/layout"
import { getLocaleAndBasePath } from "../utils/i18n"

export default function Layout({ location, children }) {
  if (location.state && location.state.isModal) {
    return children
  }
  const { locale } = getLocaleAndBasePath(location.pathname)
  return (
    <BaseLayout location={location} locale={locale}>
      {children}
    </BaseLayout>
  )
}
