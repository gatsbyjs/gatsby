/** @jsx jsx */
import { jsx } from "theme-ui"
import { Helmet } from "react-helmet"
import { OutboundLink } from "gatsby-plugin-google-analytics"
import styled from "@emotion/styled"

import { langs, isDefaultLang, makeDefaultLang } from "../utils/i18n"

import Container from "../components/container"
import FooterLinks from "../components/shared/footer-links"
import PageWithSidebar from "../components/page-with-sidebar"
import Breadcrumb from "../components/docs-breadcrumb"
import LanguageTableRow from "../components/languages/language-table-row"

import MdTranslate from "react-icons/lib/md/translate"

const TranslateBackground = styled(MdTranslate)`
  position: absolute;
  right: calc(100% + 2rem);

  font-size: 10rem;
  opacity: 0.25;

  color: ${p => p.theme.colors.link.color};
`

const allLanguages = [
  { code: "en", name: "English", localName: "English" },
  ...langs,
]

const LanguagesHeader = () => (
  <section>
    <h1 id="introduction" sx={{ mt: 0 }}>
      Languages
    </h1>
    <p>
      The Gatsby documentation is available in the languages listed below. Click
      to set your language preference. If content is not available in your
      preferred language, we will display the English default version.
    </p>
  </section>
)

const LanguagesFooter = () => (
  <section>
    <h2>How to help with translation</h2>
    <p>
      The Gatsby documentation is currently translated in over{" "}
      {allLanguages.length}+ local languages. Most of the translations are
      contributed by our international members.
    </p>
    <p>
      Don't see your language above?{" "}
      <OutboundLink href="https://github.com/gatsbyjs/gatsby/issues/21750">
        Let us know
      </OutboundLink>
      .
    </p>
  </section>
)

const LanguagesPage = ({ location }) => (
  <PageWithSidebar location={location}>
    <Helmet>
      <title>Languages</title>
      <meta
        name="description"
        content={`The Gatsby documentation is currently translated in over ${allLanguages.length}+ local languages. Set your language preference.`}
      />
    </Helmet>

    <Container>
      <TranslateBackground />
      <main id={`reach-skip-nav`}>
        <Breadcrumb location={location} />
        <LanguagesHeader />
        {allLanguages.map(lang => (
          <LanguageTableRow
            key={lang.code}
            lang={{ ...lang, progress: 0.5 }}
            isDefault={isDefaultLang(lang.code)}
            onMakeDefault={() => makeDefaultLang(lang.code)}
          />
        ))}
        <LanguagesFooter />
      </main>
      <FooterLinks />
    </Container>
  </PageWithSidebar>
)

export default LanguagesPage
