/** @jsx jsx */
import { jsx } from "theme-ui"
import BaseLayout from "../components/layout"

import { I18nProvider } from "../components/I18nContext"

export default function Layout({ location, pageContext, children }) {
  return (
    <I18nProvider locale={pageContext.locale}>
      <BaseLayout location={location}>{children}</BaseLayout>
    </I18nProvider>
  )
}
