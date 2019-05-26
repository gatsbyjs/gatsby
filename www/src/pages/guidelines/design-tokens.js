import React from "react"
import MdWarning from "react-icons/lib/md/warning"

import Annotation from "../../components/guidelines/annotation"
import {
  Container,
  Section,
  Columns,
  ContentColumn,
  CopyColumn,
} from "../../components/guidelines/containers"
import {
  Intro,
  PageHeading,
  SectionHeading,
} from "../../components/guidelines/typography"
import Layout from "../../components/guidelines/layout"
import Badge from "../../components/guidelines/badge"

import theme from "../../utils/guidelines/theme"
import { Box } from "../../components/guidelines/system"

const DesignTokens = ({ location }) => (
  <Layout pathname={location.pathname}>
    <Container>
      <div css={{ position: `relative`, zIndex: 1 }}>
        <PageHeading>
          <Annotation type="highlight" color="teal.20">
            Design Tokens
          </Annotation>
        </PageHeading>
        <Intro>
          This page collects all design tokens currently available for
          gatsbyjs.org which are not covered in "Color" or "Typography"
        </Intro>
        <Badge my={3} bg="teal.10" color="grey.50" borderColor="teal.10">
          Work in Progress{` `}
          <MdWarning style={{ fontSize: 16, marginLeft: `0.25rem` }} />
        </Badge>
      </div>
    </Container>
    <Section>
      <SectionHeading>
        <Annotation color="white">Space</Annotation>
      </SectionHeading>
      <Columns>
        <CopyColumn pr={{ xxs: 5, xs: 6, sm: 7, lg: 0 }}>
          <p>
            Spacing tokens are intended for use with <code>margin</code>,{` `}
            <code>padding</code>, and other layout-related CSS properties.
          </p>
          <p>
            The primary use for these tokens should be building individual
            components; however, as we flesh out this part of our design tokens,
            they are also expected to be used to define global (layout) spacing
            properties.
          </p>
        </CopyColumn>
        <ContentColumn>
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>rem</th>
                <th>px</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              {theme.space.map((space, index) => (
                <tr key={`tokens-space-${index}`}>
                  <td>
                    <code>space[{index}]</code>
                  </td>
                  <td>{space.substring(0, space.length - 3)}</td>
                  <td>{parseFloat(space) * 16}</td>
                  <td>
                    {` `}
                    <Box
                      key={`${index}-${space}`}
                      height={space}
                      width={space}
                      bg="teal.30"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ContentColumn>
      </Columns>
    </Section>
    <Section bg="teal.10">
      <SectionHeading>Shadows and Elevation</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Component elevation in our UI is depicted using shadows. There is a
            lot of definition work to do here, obviously.
          </p>
        </CopyColumn>
        <ContentColumn
          css={{
            alignSelf: `flex-end`,
            display: `flex`,
            flexWrap: `wrap`,
            overflow: `visible`,
          }}
        >
          {Object.keys(theme.shadows).map((shadow, i) => (
            <Box
              bg="white"
              borderRadius="2"
              key={`tokens-shadow-${i}`}
              mx={2}
              my={8}
              p={4}
              width="50%"
              boxShadow={shadow}
            >
              {shadow}
            </Box>
          ))}
        </ContentColumn>
      </Columns>
    </Section>
  </Layout>
)

export default DesignTokens
