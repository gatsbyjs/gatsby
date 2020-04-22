/** @jsx jsx */
import { jsx } from "theme-ui"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import styled from "@emotion/styled"
import { MdArrowDownward as ArrowDownwardIcon } from "react-icons/md"
import themeGet from "@styled-system/theme-get"
import { useColorMode } from "theme-ui"

import Link from "../../components/localized-link"
import Layout from "../../components/guidelines/layout"
import BoxWithBorder from "../../components/guidelines/box-with-border"
import {
  Intro,
  PageHeading,
  SectionHeading,
} from "../../components/guidelines/typography"
import {
  Container,
  Section,
  Columns,
  ContentColumn,
  CopyColumn,
} from "../../components/guidelines/containers"

import GatsbyLogo from "../../components/guidelines/logo"
import GatsbyMonogram from "../../components/guidelines/logo/monogram"
import Wordmark from "!raw-loader!../../assets/guidelines/wordmark.svg"
import Clearspace from "!raw-loader!../../assets/guidelines/clearspace.svg"
import ClearspaceMonogram from "!raw-loader!../../assets/guidelines/clearspace-monogram.svg"
import ManuallyTracked from "!raw-loader!../../assets/guidelines/manually-tracked.svg"
import PartnershipLockups from "!raw-loader!../../assets/guidelines/partnership-lockups.svg"

import ColorSwatch from "../../components/guidelines/color/card"

import { Box, Button, Flex, Text } from "../../components/guidelines/system"
import theme from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import palette from "../../utils/guidelines/extend-palette-info"

const List = styled(`ul`)`
  margin-left: 0;
  padding: 0;
  list-style: none;
`

const ListItem = styled(`li`)`
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='${props =>
    encodeURIComponent(
      themeGet(`colors.green.50`)(props)
    )}' d='M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z' /%3E%3C/svg%3E");
  background-position: 0 0.25em;
  background-repeat: no-repeat;
  background-size: 1em;
  padding-left: 1.5em;
  margin-bottom: 1em;
`

const DontListItem = styled(ListItem)`
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='${props =>
    encodeURIComponent(
      themeGet(`colors.red.50`)(props)
    )}' d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' /%3E%3C/svg%3E");
`

const Guidance = ({ children, image }) => (
  <Box mb={5} mr="20px" width={`calc(50% - 20px)`}>
    {image && (
      <BoxWithBorder withBorder width="100%">
        <Img fluid={image.childImageSharp.fluid} />
      </BoxWithBorder>
    )}
    <Text fontSize={1} color="grey.50" mt={2}>
      {children}
    </Text>
  </Box>
)

const Monogram = ({ size, ...props }) => (
  <Box
    mt={6}
    display="flex"
    css={{ flexShrink: 0, alignItems: `center`, flexDirection: `column` }}
    {...props}
  >
    <Flex
      width={size}
      mb={4}
      css={{
        svg: {
          display: `block`,
          height: `100%`,
          width: `100%`,
        },
      }}
    >
      <GatsbyMonogram />
    </Flex>
    <Text color="grey.50" fontSize={1}>
      {size} x {size}px
    </Text>
  </Box>
)

const GatsbyLogoContainered = ({
  height,
  opacity,
  inverted,
  invertedWordmark,
  ...rest
}) => (
  <Box
    {...rest}
    height={height}
    maxWidth="400px"
    css={{
      opacity: opacity || 1,
      svg: {
        display: `block`,
        width: height ? `auto` : `100%`,
        height: height ? height : false,
      },
    }}
  >
    <GatsbyLogo inverted={inverted} invertedWordmark={invertedWordmark} />
  </Box>
)

const LogoContainer = ({ bg, color, inverted, withBorder, ...rest }) => (
  <BoxWithBorder
    bg={bg}
    height={0}
    p={3}
    pb="56.25%"
    width="100%"
    withBorder={withBorder}
    {...rest}
  >
    <Flex
      alignItems="center"
      justifyContent="center"
      css={{
        position: `absolute`,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: `100%`,
        width: `100%`,
      }}
    >
      <Box
        height={{ xxs: `40px`, xxl: `48px` }}
        css={{
          svg: {
            display: `block`,
            height: `100%`,
          },
        }}
      >
        <GatsbyLogo inverted={inverted} color={color} />
      </Box>
    </Flex>
  </BoxWithBorder>
)

const Logo = ({ data, location }) => {
  const [colorMode] = useColorMode()
  const isDark = colorMode === `dark`

  return (
    <Layout location={location} pageTitle="Logo">
      <Container>
        <PageHeading>Logo</PageHeading>
        <Intro>
          The Gatsby logo is the central visual cue to identify Gatsby and its
          official resources, publications, community projects, products, and
          integrations. Everywhere the Gatsby logo shows up, it should act and
          behave the same.
        </Intro>
      </Container>

      <Section>
        <Columns>
          <CopyColumn>
            <p>
              Because Gatsby <em>is and always will be free</em> open source
              software, but also is backed by Gatsby the company, this guide is
              relevant not only for internal use, but also for our community
              members and commercial partners.
            </p>
            <p>
              Whether you want to reference Gatsby in your publication or
              service, show some love or link back to us, we hope this page
              contains everything you need.
            </p>
            <Box
              bg="highlightedBox.background"
              py={3}
              px={4}
              my={4}
              fontSize={1}
              borderRadius={2}
              maxWidth="30rem"
              color="highlightedBox.color"
            >
              Please{` `}
              <a href="https://github.com/gatsbyjs/gatsby/issues">
                open an issue
              </a>
              {` `}
              on GitHub or{` `}
              <a href="mailto:team@gatsbyjs.com">send a mail</a> to the Gatsby
              Inkteam if you have any questions, suggestions, or problems!{` `}
              <strong>Happy shipping!</strong>
            </Box>
          </CopyColumn>
          <ContentColumn>
            <GatsbyLogoContainered mb={4} invertedWordmark={isDark} />
            <p>
              Gatsby’s logo was created by Sacha Greif in late 2016, and is a
              true open source community effort.{` `}
              <span role="img" aria-label="purple heart">
                💜
              </span>
              <span role="img" aria-label="thank you">
                🙏
              </span>
              {` `}
              Check out <a href="#footnotes">the footnotes</a> to retrace the
              most important iteration steps.
            </p>
            <Button as="a" href="/Gatsby-Logos.zip" mt={6} mb={3}>
              Download all logo assets{` `}
              <ArrowDownwardIcon style={{ fontSize: 24 }} />
            </Button>
            <Text as="p" fontSize={1} color="grey.50">
              Contains EPS, PNG, and SVG files
              <br />
              v1.0, May 28, 2019
            </Text>
            <Text as="p" mb={0} fontSize={1}>
              In a hurry? Here’s just the SVGs:
            </Text>
            <Button
              outlined
              as="a"
              href="/Gatsby-Logo.svg"
              mt={3}
              mb={3}
              mr={3}
            >
              Logo SVG{` `}
              <ArrowDownwardIcon />
            </Button>
            <Button outlined as="a" href="/Gatsby-Monogram.svg" mt={3} mb={3}>
              Monogram SVG{` `}
              <ArrowDownwardIcon />
            </Button>
          </ContentColumn>
        </Columns>
      </Section>

      <Section id="dos-and-donts">
        <Columns>
          <CopyColumn sticky={false} id="dos">
            <SectionHeading>Do these awesome things</SectionHeading>
            <List>
              <ListItem>
                Use the Gatsby logo or monogram to link to gatsbyjs.org or
                gatsbyjs.com
              </ListItem>
              <ListItem>
                Use the Gatsby logo or monogram to advertise that your product
                has built-in Gatsby integration
              </ListItem>
              <ListItem>
                Use the Gatsby logo or monogram in a blog post or news article
                about Gatsby
              </ListItem>
              <ListItem>
                Use the Gatsby monogram when linking to your Gatsby community
                profile
              </ListItem>
            </List>
          </CopyColumn>
          <ContentColumn>
            <SectionHeading id="donts">
              Please don’t do these things
            </SectionHeading>
            <List>
              <DontListItem>
                Use the Gatsby logo or monogram for your application’s icon
              </DontListItem>
              <DontListItem>
                Create a modified version of the Gatsby logo or monogram, change
                the colors, dimensions or add your own text/images — please see
                the <a href="#guidance">Guidance</a> section below for examples
              </DontListItem>
              <DontListItem>
                Integrate the Gatsby logo or monogram into your logo
              </DontListItem>
              <DontListItem>
                Sell any Gatsby artwork without permission
              </DontListItem>
            </List>
          </ContentColumn>
        </Columns>
      </Section>

      <Section id="primary-logo">
        <SectionHeading>Primary Logo</SectionHeading>
        <Columns>
          <CopyColumn sticky={false}>
            <p>
              The primary Gatsby logo is a combination mark that consists of the
              Gatsby monogram/lettermark, and a wordmark. It is the preferred
              way to reference Gatsby, allowing newcomers to associate our brand
              name with the monogram. We encourage you to use it whenever
              possible.
            </p>
          </CopyColumn>
          <ContentColumn>
            <GatsbyLogoContainered invertedWordmark={isDark} />
          </ContentColumn>
        </Columns>
      </Section>

      <Section id="monogram">
        <SectionHeading>Monogram</SectionHeading>
        <Columns>
          <CopyColumn sticky={false}>
            <p>
              We use the monogram as social media profile image for our official
              Twitter and GitHub accounts, and as “favicon” for our official
              website.
            </p>
            <p>
              Furthermore the monogram may be used in cases where the
              association with Gatsby is evident, especially when space is an
              issue, e.g. like we currently do on store.gatsbyjs.org for mobile
              devices.
            </p>
          </CopyColumn>
          <ContentColumn>
            <Flex alignItems="flex-end" flexWrap="wrap">
              <Monogram size={128} mr={{ xxs: 4, lg: 6 }} />
              <Monogram size={64} mr={{ xxs: 4, lg: 6 }} />
              <Monogram size={32} mr={{ xxs: 4, lg: 6 }} />
              <Monogram size={16} display={{ xxs: `none`, lg: `block` }} />
            </Flex>
          </ContentColumn>
        </Columns>
      </Section>

      <Section id="partnership-lockups">
        <SectionHeading>Partnership Lockups</SectionHeading>
        <Columns>
          <CopyColumn sticky={false}>
            <p>
              When combining our logotype with another brand, product, or
              technology, we prefer the monogram over the logotype. It should be
              the same visual weight as the partner's logo, and connected by a
              "plus" sign.
            </p>
          </CopyColumn>
          <ContentColumn>
            <Flex alignItems="flex-end" flexWrap="wrap" />
            <Box
              maxWidth="542px"
              mb={4}
              dangerouslySetInnerHTML={{
                __html: PartnershipLockups,
              }}
              css={{ svg: { display: `block`, width: `100%` } }}
            />
          </ContentColumn>
        </Columns>
      </Section>

      <Section id="wordmark">
        <SectionHeading>Wordmark</SectionHeading>
        <Columns>
          <CopyColumn sticky={false}>
            <p>
              The typeface used to set the logo wordmark is Futura PT Demi. The
              wordmark is optically kerned, and its uppercase “G” is customized
              to partly mirror the strict geometry of the monogram.
            </p>
            <Text color="grey.40" fontSize={1}>
              Futura PT Demi
            </Text>
            <Text
              fontSize={5}
              fontFamily="heading"
              fontWeight="heading"
              lineHeight="dense"
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
              <br />
              abcdefghijklmnopqrstuvwxyz
              <br />
              1234567890!@€$%&*()-=+
            </Text>
          </CopyColumn>
          <ContentColumn>
            <Box
              maxWidth="257px"
              mb={4}
              dangerouslySetInnerHTML={{
                __html: Wordmark,
              }}
              css={{
                svg: { display: `block`, width: `100%` },
                color: isDark ? `white` : `black`,
              }}
            />
            <Box
              maxWidth="257px"
              mb={3}
              dangerouslySetInnerHTML={{
                __html: ManuallyTracked,
              }}
              css={{ svg: { display: `block`, width: `100%` } }}
            />
            <Text as="span" color="blue.70">
              Manual kerning and custom “G”
            </Text>
            {` `}
            vs.{` `}
            <Text as="span" color="red.60">
              Futura PT Demi
            </Text>
          </ContentColumn>
        </Columns>
      </Section>

      <Section id="colors">
        <SectionHeading>Colors</SectionHeading>
        <Columns>
          <CopyColumn>
            <p>
              The Gatsby logo colors are rebeccapurple (
              <Link to="/guidelines/color/">Purple 60</Link>), black, and white.
              The logo works best on a white background.
            </p>
          </CopyColumn>
          <ContentColumn>
            <LogoContainer bg="white" withBorder mb={4} />
            <Box display={{ md: `flex` }}>
              <ColorSwatch
                color={palette.purple.colors[`60`]}
                mr={{ md: 4 }}
                mb={{ xxs: 4, md: 0 }}
              />
              <ColorSwatch
                color={palette.black.color}
                mr={{ md: 4 }}
                mb={{ xxs: 4, md: 0 }}
              />
              <ColorSwatch color={palette.white.color} />
            </Box>
          </ContentColumn>
        </Columns>
        <Columns>
          <CopyColumn>
            <p>
              There are two additional, one-color versions of the Gatsby logo:
              An entirely black or white logo for those instances where the logo
              must display or print in a single color.
            </p>
            <p>For dark backgrounds, the logo should always be white.</p>
            <p>
              There are no absolutes regarding the selection of the specific
              color application, but context, contrast with regard to background
              color, and surrounding imagery and production parameters all
              should be considered.
            </p>
          </CopyColumn>
          <ContentColumn>
            <LogoContainer bg="purple.60" inverted />
          </ContentColumn>
        </Columns>
        <Columns>
          <CopyColumn>
            <p>
              Additionally, we allow the single color version of the Gatsby logo
              to adapt to light colored backgrounds as long as a healthy
              contrast is preserved. Our example uses base neutral (
              <Link to="/guidelines/color/">Grey 60</Link>) on{` `}
              <Link to="/guidelines/color/">Grey 20</Link>.
            </p>
          </CopyColumn>
          <ContentColumn>
            <LogoContainer
              bg="grey.20"
              inverted
              color={theme.colors.grey[`70`]}
            />
          </ContentColumn>
        </Columns>
      </Section>

      <Section bg="blue.5" id="clearspace">
        <SectionHeading color="black">Clearspace</SectionHeading>
        <Columns>
          <CopyColumn>
            <p sx={{ color: `grey.90` }}>
              To ensure the legibility of the logo, it must be surrounded with a
              minimum amount of clearspace. This isolates the logo from
              competing elements such as photography, text or background
              patterns that may detract attention and lessen the overall impact.
            </p>
            <Text color="grey.90">
              <Text as="span" color="magenta.50">
                Magenta
              </Text>
              {` `}
              indicates clearspace, defined by the logo wordmark x-height or by
              1/4 height of the Gatsby monogram.{` `}
              <Text as="span" color="blue.70">
                Blue
              </Text>
              {` `}
              marks type and element alignment and construction.
            </Text>
          </CopyColumn>
          <ContentColumn>
            <Box
              mb={4}
              dangerouslySetInnerHTML={{
                __html: Clearspace,
              }}
              css={{ svg: { display: `block`, maxWidth: 506 } }}
            />
            <Text as="p" mb={7} fontSize={1} color="grey.50">
              <Text as="span" color="magenta.50">
                Clearspace
              </Text>
              {` `}
              around the logo is equal to the wordmark x-height.
            </Text>
            <Box
              mb={4}
              dangerouslySetInnerHTML={{
                __html: ClearspaceMonogram,
              }}
              css={{ svg: { display: `block`, maxWidth: 122 } }}
            />
            <Text as="p" mb={0} fontSize={1} color="grey.50">
              <Text as="span" color="magenta.50">
                Clearspace
              </Text>
              {` `}
              around the monogram equals 1/4 of its height.
            </Text>
          </ContentColumn>
        </Columns>
        <SectionHeading id="scale">Scale</SectionHeading>
        <Columns>
          <CopyColumn sticky={false}>
            <p sx={{ color: `grey.90` }}>
              Our logo is designed to scale to small sizes on print and screen.
            </p>
            <p sx={{ color: `grey.90` }}>
              Smallest size: 24 pixels high for screens, 0.3 inch/0.762
              centimeter high for print.
            </p>
          </CopyColumn>
          <ContentColumn>
            <div css={{ position: `relative` }}>
              <GatsbyLogoContainered opacity={0.025} />
              <div
                css={{
                  position: `absolute`,
                  zIndex: 1,
                  height: 24,
                  top: `auto`,
                  bottom: 0,
                }}
              >
                <GatsbyLogoContainered height="24px" />
              </div>
            </div>
            <Text as="p" mt={2} fontSize={1} color="grey.50">
              Logo at 24px height
            </Text>
          </ContentColumn>
        </Columns>
      </Section>

      <Section id="guidance">
        <SectionHeading>Guidance</SectionHeading>
        <Columns>
          <CopyColumn>
            <p>
              Please help us maintain the integrity of the Gatsby logo and
              promote the consistency of the brand by not misusing it. Be
              responsible, not reckless.{` `}
              <span role="img" aria-label="thank you">
                🙏
              </span>
            </p>
            <p>
              If you find your needs are not covered by the logo and its
              recommended usage, please{` `}
              <a href="mailto:team@gatsbyjs.com">get in touch</a>.
            </p>
          </CopyColumn>
          <ContentColumn>
            <Flex flexWrap="wrap">
              {data.allGuidanceYaml.nodes.map((node, index) => (
                <Guidance
                  image={node.image && node.image}
                  key={`logo-guidance-${index}`}
                >
                  {node.description}
                </Guidance>
              ))}
            </Flex>
          </ContentColumn>
        </Columns>
      </Section>

      <Section id="footnotes">
        <SectionHeading>Footnotes</SectionHeading>
        <Columns>
          <CopyColumn>
            <p>
              Originally created by Sacha Greif in late 2016, the Gatsby logo is
              a true open source community effort. We compiled some of the steps
              that lead to the current version of the logo:
            </p>
          </CopyColumn>
          <ContentColumn>
            <ul>
              {data.allFootnotesYaml.nodes.map((node, index) => (
                <Text as="li" key={`logo-footnotes-${index}`} mb={3}>
                  {node.description}:<br />
                  <a
                    css={{
                      color: theme.colors.purple[`50`],
                      textDecoration: `none`,
                    }}
                    href={node.href}
                    key={`logo-footnotes-${index}`}
                  >
                    {node.href.replace(/^(?:https?:\/\/)?(?:www\.)?/i, ``)}
                  </a>
                </Text>
              ))}
            </ul>
          </ContentColumn>
        </Columns>
      </Section>
    </Layout>
  )
}

export default Logo

export const pageQuery = graphql`
  query logoGuideQuery {
    allFootnotesYaml {
      nodes {
        description
        href
      }
    }
    allGuidanceYaml {
      nodes {
        description
        image {
          childImageSharp {
            fluid(maxWidth: 380, quality: 80) {
              ...GatsbyImageSharpFluid_noBase64
            }
          }
        }
      }
    }
  }
`
