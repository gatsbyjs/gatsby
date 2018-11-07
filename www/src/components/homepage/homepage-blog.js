import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

import HomepageSection from "./homepage-section"
import EcosystemSection from "../ecosystem/ecosystem-section"

import { EcosystemIcon } from "../../assets/mobile-nav-icons"
import { PluginsIcon, StartersIcon } from "../../assets/ecosystem-icons"

const HomepageBlog = () => (
  <HomepageSection
    sectionName="Blog"
    sectionIcon={EcosystemIcon}
    title="The Gatsby Gasette"
    links={[
      {
        label: `View All`,
        to: `/blog/`,
      },
      {
        label: `Submit an Article`,
        to: `/blog/`,
      },
    ]}
  >
    &nbsp;
  </HomepageSection>
)

HomepageBlog.propTypes = {}

export default HomepageBlog
