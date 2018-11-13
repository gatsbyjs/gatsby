import React, { Component } from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

import EcosystemSection from "./ecosystem-section"

import presets from "../../utils/presets"

const EcosystemBoardRoot = styled(`div`)`
  display: flex;
  flex-direction: column;

  ${presets.Tablet} {
    flex-direction: row;
    flex-wrap: wrap;
    height: calc(
      100vh - (${presets.bannerHeight} + ${presets.headerHeight} + 1px)
    );
    padding: 2rem 1rem 1rem;
  }
`

class EcosystemBoard extends Component {
  observer
  observerTargets = []

  componentDidMount() {
    if (typeof window.IntersectionObserver !== `undefined`) {
      this.setupObserver()
    }
  }

  componentWillUnmount() {
    if (typeof window.IntersectionObserver !== `undefined`) {
      this.observerTargets.forEach(target => this.observer.unobserve(target))
    }
  }

  setupObserver = () => {
    const options = { rootMargin: `0px`, threshold: [1] }
    this.observer = new IntersectionObserver(this.handleIntersect, options)
    this.observerTargets = Array.from(
      document.querySelectorAll(`.featuredItems`)
    )

    this.observerTargets.forEach(target => this.observer.observe(target))
  }

  handleIntersect = (entries, observer) => {
    entries.forEach(entry => {
      const target = entry.target

      if (entry.intersectionRatio > 0) {
        setTimeout(
          () => this.turnOnLeadScroll({ target, duration: 1000, distance: 20 }),
          250
        )
        this.observer.unobserve(target)
      }
    })
  }

  turnOnLeadScroll = ({ target, duration, distance }) => {
    let startTime = null

    function animation(currentTime) {
      if (startTime === null) {
        startTime = currentTime
      }

      const timeElapsed = currentTime - startTime
      const getDistanceToScroll = ease(timeElapsed, 0, distance, duration)

      target.scroll({ top: 0, left: getDistanceToScroll })

      if (timeElapsed < duration) {
        requestAnimationFrame(animation)
      }
    }

    function ease(t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b
    }

    requestAnimationFrame(animation)
  }

  render() {
    const {
      icons: { plugins: PluginsIcon, starters: StartersIcon },
      starters,
      plugins,
    } = this.props

    return (
      <EcosystemBoardRoot>
        <EcosystemSection
          title="Plugins"
          description="Plugins are packages that extend Gatsby sites. They can source content, transform data, and more!"
          subTitle="Featured Plugins"
          icon={PluginsIcon}
          links={[
            { label: `Browse Plugins`, to: `/plugins/` },
            {
              label: `Plugin Authoring`,
              to: `/docs/plugin-authoring/`,
              secondary: true,
            },
            { label: `Plugin Docs`, to: `/docs/plugins/`, secondary: true },
          ]}
          featuredItems={plugins}
        />
        <EcosystemSection
          title="Starters"
          description="Starters are Gatsby sites that are preconfigured for different use cases to give you a head start for your project."
          subTitle="Featured Starters"
          icon={StartersIcon}
          links={[
            { label: `Browse Starters`, to: `/starters/` },
            { label: `Starter Docs`, to: `/docs/starters/`, secondary: true },
          ]}
          featuredItems={starters}
        />
        <EcosystemSection
          title="External Resources"
          description="A curated list of interesting Gatsby community projects and learning resources like podcasts and tutorials."
          links={[{ label: `Browse Resources`, to: `/docs/awesome-gatsby/` }]}
        />
      </EcosystemBoardRoot>
    )
  }
}

EcosystemBoard.propTypes = {
  icons: PropTypes.object,
  starters: PropTypes.array,
  plugins: PropTypes.array,
}

export default EcosystemBoard
