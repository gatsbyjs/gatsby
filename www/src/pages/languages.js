/** @jsx jsx */
import React from "react"
import { jsx, useColorMode } from "theme-ui"
import { Helmet } from "react-helmet"
import styled from "@emotion/styled"

import { langs, defaultLang } from "../utils/i18n"

import Link from "../components/localized-link"
import Container from "../components/container"
import FooterLinks from "../components/shared/footer-links"
import Breadcrumb from "../components/docs-breadcrumb"
import LanguageThumb from "../components/languages/language-thumb"

import { MdTranslate as TranslateIcon } from "react-icons/md"

const TranslateBackground = styled(TranslateIcon)`
  position: absolute;
  right: calc(100% + 2rem);

  font-size: 10rem;
  opacity: 0.25;

  color: ${p =>
    p.colorMode === "dark" ? p.theme.colors.grey[10] : p.theme.colors.grey[90]};
`

const LanguagesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: -${p => p.theme.space[4]};
  margin-bottom: ${p => p.theme.space[8]};
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
      <Link to="/contributing/translation/">Let us know</Link>.
    </p>
  </section>
)

const LanguagesPage = ({ location, pageContext }) => {
  const [colorMode] = useColorMode()

  return (
    <>
      <Helmet>
        <title>Languages</title>
        <meta
          name="description"
          content={`The Gatsby documentation is currently translated in over ${allLanguages.length}+ local languages. Set your language preference.`}
        />
      </Helmet>
      <Container>
        <TranslateBackground colorMode={colorMode} />
        <main id={`reach-skip-nav`}>
          <Breadcrumb location={location} />
          <LanguagesHeader />
          <LanguagesContainer>
            {allLanguages.map(lang => (
              <LanguageThumb
                key={lang.code}
                lang={lang}
                isCurrent={lang.code === (pageContext.locale || defaultLang)}
              />
            ))}
          </LanguagesContainer>
          <LanguagesFooter />
        </main>
      </Container>
      <FooterLinks />
    </>
  )
}

export default LanguagesPage
