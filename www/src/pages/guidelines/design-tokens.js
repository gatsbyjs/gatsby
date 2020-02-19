import React from "react"
import MdWarning from "react-icons/lib/md/warning"
import Link from "gatsby-link"

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
  SrOnly,
} from "../../components/guidelines/typography"
import Layout from "../../components/guidelines/layout"
import Badge from "../../components/guidelines/badge"

import theme from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import { Box, Flex, Text } from "../../components/guidelines/system"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const ColorExample = ({ hex, token }) => (
  <tr>
    <td
      css={{
        borderColor: hex,
        verticalAlign: `middle`,
      }}
    >
      <code>{token}</code>
    </td>
    <td
      css={{
        borderColor: hex,
        verticalAlign: `middle`,
        width: `100%`,
      }}
    >
      {hex}
    </td>
    <td
      css={{
        borderColor: hex,
        verticalAlign: `middle`,
      }}
    >
      <Flex alignItems="center">
        <Text color={hex} fontWeight="bold" fontSize={6} mr={8}>
          Aa
        </Text>
        <div
          css={{
            backgroundColor: hex,
            height: 40,
            margin: 0,
            width: 80,
          }}
        />
      </Flex>
      <SrOnly>
        Example text and color swatch with <code>color</code>/
        <code>background-color</code> set to <code>{token}</code>.
      </SrOnly>
    </td>
  </tr>
)

const DesignTokens = ({ location }) => (
  <Layout location={location} pageTitle="Design Tokens">
    <Container>
      <div css={{ position: `relative`, zIndex: 1 }}>
        <PageHeading>Design Tokens</PageHeading>
        <Intro>
          This page collects all design tokens currently available for
          gatsbyjs.org which are not covered on sibling pages.
        </Intro>
        <Badge my={3}>
          Work in Progress{` `}
          <MdWarning style={{ fontSize: 16, marginLeft: `0.25rem` }} />
        </Badge>
      </div>
    </Container>

    <Section>
      <Columns>
        <CopyColumn sticky={false} narrow={false}>
          <p>
            Our design tokens can be imported from{` `}
            <code>src/utils/presets</code>. We are following the{` `}
            <a href="https://system-ui.com/theme">
              System UI Theme Specification
            </a>
            . This page is not a complete list of all available tokens yet.
            Please bear with us as we sort out documentation for what is
            currently missing.
          </p>
        </CopyColumn>
      </Columns>
    </Section>

    <Section>
      <SectionHeading>Space</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Spacing tokens are intended for use with <code>margin</code>,{` `}
            <code>padding</code>, and other layout-related CSS properties.
          </p>
          <p>
            The primary use should be building individual components; however,
            as we flesh out this part of our design tokens, they are also
            expected to be used to define global (layout) spacing properties.
          </p>
        </CopyColumn>
        <ContentColumn>
          <table>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">rem</th>
                <th scope="col">px</th>
                <th scope="col">Example</th>
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
                      bg="grey.30"
                    />
                    <SrOnly>
                      A box with <code>space[{index}]</code> set as value for
                      the <code>height</code> and <code>width</code> CSS
                      properties. This should result in a{` `}
                      {parseFloat(space) * 16}&times;
                      {parseFloat(space) * 16}px box being rendered.
                    </SrOnly>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ContentColumn>
      </Columns>
    </Section>

    <Section bg="ui.background">
      <SectionHeading>Shadows &amp; Elevation</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Component elevation in our UI is depicted using shadows. These
            tokens are intended to be used with the <code>box-shadow</code> CSS
            property.
          </p>
          <p>
            There is a lot of definition work to do here, which is why we
            deliberately chose to omit adding more documentation at this point.
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
              mb={10}
              mr={4}
              p={4}
              width="50%"
              boxShadow={shadow}
              height={0}
              pb={`${0.3 * 100}%`}
            >
              <code>shadows.{shadow}</code>
            </Box>
          ))}
        </ContentColumn>
      </Columns>
    </Section>

    <Section>
      <SectionHeading>Z-Indices</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Intended to be used with the <code>box-shadow</code> CSS property,
            these tokens along "Shadows &amp; Elevation" define the order of
            components along the z-axis.
          </p>
        </CopyColumn>
        <ContentColumn fullWidth width="100%">
          <Flex>
            <table css={{ width: `50%` }}>
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(theme.zIndices).map((zIndex, i) => (
                  <tr key={`tokens-zIndices-${i}`}>
                    <td css={{ verticalAlign: `top` }}>
                      <code>zIndices.{zIndex}</code>
                    </td>
                    <td css={{ verticalAlign: `top` }}>
                      {theme.zIndices[zIndex]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Flex>
        </ContentColumn>
      </Columns>
    </Section>

    <Section>
      <SectionHeading>Radii</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Intended for use with the <code>border-radius</code> CSS property.
            Currently defined in <code>px</code>, which means they do not yet
            scale when adjusting the root font size.
          </p>
        </CopyColumn>
        <ContentColumn>
          <table>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">px</th>
                <th scope="col">Example</th>
              </tr>
            </thead>
            <tbody>
              {theme.radii.map((radius, index) => (
                <tr key={`tokens-radii-${index}`}>
                  <td>
                    <code>radii[{index}]</code>
                  </td>
                  <td>{radius}</td>
                  <td>
                    {` `}
                    <Box
                      key={`${index}-radius`}
                      height={40}
                      width={80}
                      bg="grey.30"
                      borderRadius={index}
                    />
                    <SrOnly>
                      A 80&times;40px box with <code>radii[{index}]</code>
                      {` `}
                      set as value for the <code>border-radius</code> CSS
                      property.
                    </SrOnly>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ContentColumn>
      </Columns>
    </Section>

    <Section>
      <SectionHeading>Fonts</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Intended for use with the <code>font-family</code> CSS property.
          </p>
        </CopyColumn>
        <ContentColumn>
          <table>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Value</th>
                <th scope="col">Example</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(theme.fonts).map((font, i) => (
                <tr key={`tokens-fonts-${i}`}>
                  <td css={{ verticalAlign: `top` }}>
                    <code>fonts.{font}</code>
                  </td>
                  <td css={{ verticalAlign: `top` }}>{theme.fonts[font]}</td>
                  <td css={{ verticalAlign: `top` }}>
                    <Text fontFamily={font} fontSize={4}>
                      ABC
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ContentColumn>
      </Columns>
    </Section>

    <Section pr={{ xxs: 0, xs: 0, sm: 0, md: 0, lg: 0 }}>
      <SectionHeading>Font Sizes</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Intended for use with the <code>font-size</code> CSS property.
          </p>
        </CopyColumn>
        <ContentColumn fullWidth>
          <table>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Value</th>
                <th scope="col">Example</th>
              </tr>
            </thead>
            <tbody>
              {theme.fontSizes.map((size, index) => (
                <tr key={`${index}-${size}`}>
                  <td>
                    <code>fontSizes[{index}]</code>
                  </td>
                  <td>{size}</td>
                  <td>
                    <Text
                      // don't scale based on root font size here
                      fontSize={`${parseFloat(size) * 16}px`}
                      color="grey.90"
                      lineHeight="solid"
                      css={{
                        whiteSpace: `nowrap`,
                      }}
                    >
                      Gatsby believed in the green light, the orgastic future
                      that year by year recedes before us.
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ContentColumn>
      </Columns>
    </Section>

    <Section>
      <SectionHeading>Font Weights</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Intended for use with the <code>font-weight</code> CSS property.
          </p>
        </CopyColumn>
        <ContentColumn>
          <Flex>
            <table>
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Value</th>
                  <th scope="col">Example</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(theme.fontWeights).map((fontWeight, i) => (
                  <tr key={`tokens-fontWeights-${i}`}>
                    <td css={{ verticalAlign: `top` }}>
                      <code>fontWeights[{fontWeight}]</code>
                    </td>
                    <td css={{ verticalAlign: `top` }}>
                      {theme.fontWeights[fontWeight]}
                    </td>
                    <td>
                      <Text
                        fontWeight={fontWeight}
                        color="grey.90"
                        lineHeight="solid"
                      >
                        Aa
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Flex>
        </ContentColumn>
      </Columns>
    </Section>

    <Section pr={{ xxs: 0, xs: 0, sm: 0, md: 0, lg: 0 }}>
      <SectionHeading>Letter Spacing</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Intended for use with the <code>letter-spacing</code> CSS property.
          </p>
        </CopyColumn>
        <ContentColumn fullWidth>
          <Flex>
            <table>
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Value</th>
                  <th scope="col">Example</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(theme.letterSpacings).map((letterSpacing, i) => (
                  <tr key={`tokens-letterSpacings-${i}`}>
                    <td css={{ verticalAlign: `top` }}>
                      <code>letterSpacings.{letterSpacing}</code>
                    </td>
                    <td css={{ verticalAlign: `top` }}>
                      {theme.letterSpacings[letterSpacing]}
                    </td>
                    <td>
                      <Text
                        letterSpacing={letterSpacing}
                        color="text"
                        lineHeight="solid"
                        css={{
                          whiteSpace: `nowrap`,
                        }}
                      >
                        Gatsby believed in the green light, the orgastic future
                        that year by year recedes before us.
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Flex>
        </ContentColumn>
      </Columns>
    </Section>

    <Section>
      <SectionHeading>Line Heights</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Intended for use with the <code>line-height</code> CSS property.
          </p>
        </CopyColumn>
        <ContentColumn fullWidth>
          <table>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Value</th>
                <th scope="col">Example</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(theme.lineHeights).map((lineHeight, i) => (
                <tr key={`tokens-lineHeights-${i}`}>
                  <td css={{ verticalAlign: `top` }}>
                    <code>lineHeights.{lineHeight}</code>
                  </td>
                  <td css={{ verticalAlign: `top` }}>
                    {theme.lineHeights[lineHeight]}
                  </td>
                  <td css={{ verticalAlign: `top` }}>
                    <Text lineHeight={lineHeight}>
                      Plugins are packages that extend Gatsby sites. They can
                      source content, transform data, and more!
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ContentColumn>
      </Columns>
    </Section>

    <Section>
      <SectionHeading>Breakpoints &amp; Media Queries</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            For convenience, a <code>mediaQueries</code> scale derived from the
            {` `}
            <code>breakpoints</code> scale is available.
          </p>
        </CopyColumn>
        <ContentColumn fullWidth width="100%">
          <Flex>
            <table css={{ width: `50%` }}>
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(theme.breakpoints).map((breakpoint, i) => (
                  <tr key={`tokens-breakpoints-${i}`}>
                    <td css={{ verticalAlign: `top` }}>
                      <code>breakpoints.{breakpoint}</code>
                    </td>
                    <td css={{ verticalAlign: `top` }}>
                      {theme.breakpoints[breakpoint]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Box as="table" ml={10}>
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(theme.breakpoints).map((breakpoint, i) => (
                  <tr key={`tokens-breakpoints-${i}`}>
                    <td css={{ verticalAlign: `top` }}>
                      <code>mediaQueries.{breakpoint}</code>
                    </td>
                    <td css={{ verticalAlign: `top` }}>
                      {mediaQueries[breakpoint]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Flex>
        </ContentColumn>
      </Columns>
    </Section>

    <Section>
      <SectionHeading>Colors</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Please also see the <Link to="/guidelines/color/">Colors</Link>
            {` `}
            section for detailed information and accessibility notes.
          </p>
        </CopyColumn>
        <ContentColumn fullWidth width="100%">
          <Flex>
            <table>
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Hex</th>
                  <th scope="col">Example</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(theme.colors).map((color, i) => {
                  if (typeof theme.colors[color] === `object`) {
                    return Object.keys(theme.colors[color]).map((range, i) => (
                      <ColorExample
                        key={`tokens-colors-${color}-${i}`}
                        hex={
                          typeof theme.colors[color][range] !== `object` &&
                          theme.colors[color][range]
                        }
                        token={`colors.${color}.${range}`}
                      />
                    ))
                  } else if (typeof color === `string`) {
                    return (
                      <ColorExample
                        key={`tokens-colors-${color}-${i}`}
                        hex={theme.colors[color]}
                        token={`colors.${color}`}
                      />
                    )
                  }
                  return false
                })}
              </tbody>
            </table>
          </Flex>
        </ContentColumn>
      </Columns>
    </Section>

    <Section>
      <SectionHeading>Transition</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Intended to be used with the <code>transition</code> CSS property.
          </p>
        </CopyColumn>
        <ContentColumn>
          <Flex>
            <table>
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(theme.transition).map(token => {
                  if (typeof theme.transition[token] === `object`) {
                    return Object.keys(theme.transition[token]).map(
                      (value, i) => (
                        <tr key={`tokens-transition-${i}`}>
                          <td>
                            <code>{`transition.${token}.${value}`}</code>
                          </td>
                          <td>{theme.transition[token][value]}</td>
                        </tr>
                      )
                    )
                  }
                  return false
                })}
              </tbody>
            </table>
          </Flex>
        </ContentColumn>
      </Columns>
    </Section>
  </Layout>
)

export default DesignTokens
