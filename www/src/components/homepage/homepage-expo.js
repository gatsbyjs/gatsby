import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

import HomepageSection from "./homepage-section"
import EcosystemSection from "../ecosystem/ecosystem-section"

import { EcosystemIcon } from "../../assets/mobile-nav-icons"
import { PluginsIcon, StartersIcon } from "../../assets/ecosystem-icons"

const HomepageExpo = () => (
  <HomepageSection
    sectionName="Expo"
    sectionIcon={EcosystemIcon}
    title="Shiny Showcase Headline"
    introduction="We believe that apart from trying Gatsby yourself, taking a look at the awesome things that people build with it is a great way to convice you to give Gatsby a chance. Browse away:"
    links={[
      {
        label: `Explore the Gatsby Ecosystem`,
        to: `/ecosystem/`,
      },
    ]}
  >
    CONTENT
  </HomepageSection>
)

HomepageExpo.propTypes = {}

export default HomepageExpo
