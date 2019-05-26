import React from "react"
import Modal from "react-modal"
import MdWarning from "react-icons/lib/md/warning"

import Layout from "../../components/guidelines/layout"

import {
  Container,
  Section,
  Columns,
  CopyColumn,
  ContentColumn,
} from "../../components/guidelines/containers"
import {
  Intro,
  PageHeading,
  SectionHeading,
  SectionSubheading,
} from "../../components/guidelines/typography"

import Annotation from "../../components/guidelines/annotation"
import Badge from "../../components/guidelines/badge"
import Overview from "../../components/guidelines/color/overview"
import ColorModal from "../../components/guidelines/color/modal"

import palette from "../../utils/guidelines/extend-palette-info"

// http://reactcommunity.org/react-modal/accessibility/
Modal.setAppElement(`#___gatsby`)

class Color extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isModalOpen: false,
      color: false,
    }
  }

  handleModalOpen = (event, node) => {
    event.persist()
    document.querySelector(`html`).style.overflowY = `hidden`
    this.setState({ isModalOpen: true, color: node })
  }

  handleModalClose = event => {
    event.persist()
    document.querySelector(`html`).style.overflowY = `auto`
    this.setState({ isModalOpen: false })
  }

  render() {
    return (
      <Layout pathname={this.props.location.pathname}>
        <Container>
          <PageHeading>Color</PageHeading>
          <Intro>
            <Annotation color="orange.60" type="line">
              Bold
            </Annotation>
            ,{` `}
            <Annotation delay={1000} type="line">
              vibrant
            </Annotation>
            {` `}
            and{` `}
            <Annotation color="teal.50" delay={1500} type="line">
              friendly
            </Annotation>
            {` `}
            color is one cornerstone of Gatsby’s design. It distinguishes our
            brand and helps us to create consistent experiences and meaningful
            expressions across marketing and products.
          </Intro>
          <Badge my={3}>
            Work in Progress{` `}
            <MdWarning style={{ fontSize: 16, marginLeft: `0.25rem` }} />
          </Badge>
        </Container>

        <Section>
          <Columns>
            <CopyColumn>
              <p>
                Our color palette includes primary and secondary colors that can
                be used for interfaces as well as illustrations.
              </p>
            </CopyColumn>
          </Columns>
          <Overview handler={this.handleModalOpen} />
        </Section>

        <Section>
          <SectionHeading>Accessibility</SectionHeading>
          <Columns>
            <CopyColumn>
              <p>
                We are committed to complying with{` `}
                <a href="https://www.w3.org/WAI/intro/wcag">WCAG 2.0</a> AA
                standard contrast ratios. To do this, we choose primary,
                secondary and neutral colors that support usability. This
                ensures sufficient color contrast between elements so that users
                with low vision can see and use our products.
              </p>
            </CopyColumn>
            <ContentColumn>
              <SectionSubheading>Color Contrast</SectionSubheading>
              <h4>Score and Ratio</h4>
              <p>
                There is an equation provided by the WCAG (Web Content
                Accessibility Guidelines) that determines these two values.
              </p>
              <ol>
                <li>The Score</li>
                <li>The Ratio</li>
              </ol>
              <p>
                The equation outputs a number between 0 and 21, with 21 being
                the highest amount of contrast—think black text and a white
                background—and 0 being no contrast—white on white.
              </p>
              <p>
                The output of contrast between any two colors will fall
                somewhere on the spectrum between 0 – 21. That's where the
                scores are derived from.
              </p>
              <p>
                <Annotation type="line" delay={1000}>
                  There are technically 5 scores.
                </Annotation>
              </p>
              <ul>AAA AAA Large AA AA Large Fail</ul>
              <ul css={{ padding: 0 }}>
                <li>
                  <strong>&times; — Fail</strong> –&nbsp;Your text doesn't have
                  enough contrast with the background. You probably want to make
                  it darker. This is a score of less than <code>3.0</code>.
                </li>
                <li>
                  <strong>2+ — AA Large</strong> – The smallest acceptable
                  amount of contrast for type sizes of 18pt and larger. This is
                  a score of at least <code>3.0</code>.
                </li>
                <li>
                  <strong>2 — AA</strong> –&nbsp;This is the sweet spot for text
                  sizes below ~18pt. This is a score of at least{` `}
                  <code>4.5</code>.
                </li>
                <li>
                  <strong>3 — AAA</strong> –&nbsp;This is enhanced contrast with
                  a score of at least <code>7.0</code>. Think longer form
                  articles that will be read for a significant period of time.
                </li>
              </ul>
              <h4>Color Blindness</h4>
              <p>
                There are different types of color blindness. The most common
                form is red-green color blindness, followed by blue-yellow color
                blindness and total color blindness. Red-green color blindness
                affects up to 8% of males and 0.5% of females. Ensure that
                adjacent color shades are distinguishable for color blind
                people. Use a color blindness analyzer to confirm your choices.
              </p>
            </ContentColumn>
          </Columns>
        </Section>

        <Modal
          closeTimeoutMS={300}
          contentLabel="Example Modal In Gatsby"
          isOpen={this.state.isModalOpen}
          onRequestClose={this.handleModalClose}
          style={{
            content: {
              top: `0`,
              left: `0`,
              right: `0`,
              bottom: `0`,
              marginRight: `0`,
              transform: `0`,
              padding: 0,
              borderRadius: 0,
              border: 0,
            },
            overlay: {
              zIndex: 1000,
            },
          }}
        >
          <ColorModal
            color={this.state.color}
            handleModalClose={this.handleModalClose}
            palette={palette}
          />
        </Modal>
      </Layout>
    )
  }
}

export default Color
