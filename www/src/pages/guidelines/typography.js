/** @jsx jsx */
import { jsx } from "theme-ui"
import styled from "@emotion/styled"
import MdWarning from "react-icons/lib/md/warning"

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
  SectionSubheading,
} from "../../components/guidelines/typography"
import Layout from "../../components/guidelines/layout"
import Badge from "../../components/guidelines/badge"
import Starter from "../../components/guidelines/cards/starter"
import Blog from "../../components/guidelines/cards/blog"
import ImagePlaceholder from "../../components/guidelines/image-placeholder"

import {
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
} from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import {
  Box,
  Button,
  Flex,
  Link,
  Heading,
  Text,
} from "../../components/guidelines/system"

const ExampleBox = styled(Box)({ pt: 4 })

const MarketingColumn = ({ children, title }) => (
  <Box width={{ lg: 1 / 2 }} px={{ md: 8 }} py={{ xxs: 4, lg: 0 }}>
    <Heading fontSize={5} mb={3} fontWeight="heading">
      {title}
    </Heading>
    <Text color="textMuted">{children}</Text>
  </Box>
)

const Typeface = ({ children, fontFamily }) => (
  <Text
    color="text"
    fontFamily={fontFamily}
    fontSize={{ xxs: 8, lg: 12 }}
    lineHeight="solid"
    mt={5}
    width="100%"
  >
    {children}
  </Text>
)

const SidebarUL = ({ children }) => (
  <Text as="ul" m={0} p={0} css={{ listStyle: `none` }}>
    {children}
  </Text>
)

const SidebarLI = ({ children }) => (
  <Text as="li" p={0} fontSize={1} my={3} color="grey.50">
    {children}
  </Text>
)

const Weight = ({ children, fontFamily, fontWeight }) => (
  <Text
    fontFamily={fontFamily}
    fontSize={12}
    fontWeight={fontWeight}
    lineHeight="solid"
    mb={2}
  >
    {children}
  </Text>
)

const Typography = ({ location }) => (
  <Layout location={location} pageTitle="Typography">
    <Container>
      <div css={{ position: `relative`, zIndex: 1 }}>
        <PageHeading>Typography</PageHeading>
        <Intro>
          Typography provides the core structure of a well-designed interface.
          Gatsby’s typography strives to create clear hierarchies, useful
          organizations, and purposeful alignments that guide the user through
          content, product, and experience.
        </Intro>
        <Badge my={3}>
          Work in Progress{` `}
          <MdWarning style={{ fontSize: 16, marginLeft: `0.25rem` }} />
        </Badge>
      </div>
    </Container>
    <Section>
      <SectionHeading>Font stack</SectionHeading>
      <Columns>
        <CopyColumn sticky={false}>
          <p>
            Gatsby uses the all-time classic Futura for headlines and display
            copy. Long form text such as articles and documentation currently
            use the native font stack, but we are actively looking for a serif
            to increase the reading experience.
          </p>
        </CopyColumn>
        <ContentColumn css={{ alignSelf: `flex-end`, display: `flex` }}>
          <Flex flexDirection="column">
            <Typeface fontFamily="heading">Futura PT</Typeface>
          </Flex>
        </ContentColumn>
      </Columns>
      <Columns>
        <CopyColumn>
          <SectionSubheading>The native font stack</SectionSubheading>
          <p>
            The “native font stack” depends on the user’s operating system and
            device; depending on that, we use San Francisco UI, Roboto or Segoe
            UI.
          </p>
          <Text as="p">
            Our monospace font stack also makes use of the default fonts
            available: That’s usually San Francisco Mono, Menlo or Monaco on Mac
            OS X, Consolas on Windows, or Liberation Sans on Linux
            distributions.
          </Text>
          <Text as="p" mb={0}>
            In our (Figma, Sketch, etc.) designs we use Roboto as it’s easily
            available.
          </Text>
        </CopyColumn>
        <ContentColumn css={{ alignSelf: `flex-end`, display: `flex` }}>
          <Flex flexDirection="column">
            <Typeface fontFamily="system">Sans-serif</Typeface>
            <Typeface fontFamily="monospace">Monospace</Typeface>
          </Flex>
        </ContentColumn>
      </Columns>
    </Section>
    <Section pr={{ xxs: 0, xs: 0, sm: 0, md: 0, lg: 0 }}>
      <SectionHeading>Scale</SectionHeading>
      <Columns>
        <CopyColumn>
          <p>
            Since our primary use for the design system is interface design, our
            typographic scale is hand-crafted. This way we don’t have to worry
            about decimals in our design tools or when calculating line heights,
            don’t have to worry about subpixel rounding errors, and have total
            control over which sizes exist instead of outsourcing that job to a
            mathematical formula.
          </p>
          <Text as="p" mb={0}>
            For long form content like articles, using a modular scale is
            totally fine though. Typography.js makes setting up and using such a
            scale easy.
          </Text>
        </CopyColumn>
        <ContentColumn fullWidth>
          {fontSizes.map((size, index) => (
            <div key={`${index}-${size}`}>
              <Text
                // don't scale based on root font size here
                fontSize={`${parseFloat(size) * 16}px`}
                color="text"
                css={{
                  overflow: `hidden`,
                  position: `relative`,
                  whiteSpace: `nowrap`,
                }}
              >
                Gatsby believed in the green light, the orgastic future that
                year by year recedes before us. It eluded us then, but that's no
                matter—tomorrow we will run faster, stretch out our arms
                farther… And one fine morning— So we beat on, boats against the
                current, borne back ceaselessly into the past.
              </Text>
              <Box
                fontSize={0}
                mb={fontSizes.length === index + 1 ? 0 : 3}
                color="textMuted"
              >
                <strong>{parseFloat(size) * 16}</strong>&nbsp;&nbsp;&nbsp;{size}
                &nbsp;&nbsp;&nbsp;
                <code
                  css={{
                    background: `transparent`,
                    ":before, :after": { display: `none` },
                  }}
                >
                  fontSizes[{index}]
                </code>
              </Box>
            </div>
          ))}
        </ContentColumn>
      </Columns>
    </Section>
    <Section>
      <h2>Weights, letter spacings and line heights</h2>
      <Columns>
        <CopyColumn>
          <p>
            <strong>A note on Futura PT Bold:</strong> While Futura PT Bold
            works well at display size, it gets hard to read below ~30px. For
            screens, use it for the page title (once per page). Do not use it
            for "bold" text—that is the job of Futura PT Demi.
          </p>
        </CopyColumn>
        <ContentColumn>
          <SectionSubheading mt={0}>Font Weights</SectionSubheading>
          <Flex flexWrap="wrap" flexDirection="row">
            <Box maxWidth={{ xl: `40%` }} mr={{ xl: 6 }}>
              <Weight fontFamily="heading" fontWeight="extraBold">
                {fontWeights.extraBold}
              </Weight>
              <Box pb={4}>
                <code>fontWeights.extraBold</code>
                <Text as="p" pt={4}>
                  Use this for the main headline, set in Futura PT Bold, only.
                </Text>
              </Box>
            </Box>

            <Box maxWidth={{ xl: `40%` }}>
              <Weight fontFamily="heading" fontWeight="bold">
                {fontWeights.bold}
              </Weight>
              <Box pb={4}>
                <code>fontWeights.bold</code> — <code>bold</code>
                <Text as="p" pt={4}>
                  Use this for the all headlines but the main page title, and to
                  emphasize text throughout regular copy.
                </Text>
              </Box>
            </Box>
            <Box>
              <Weight fontFamily="heading" fontWeight="body">
                {fontWeights.body}
              </Weight>
              <code>fontWeights.body</code> — <code>normal</code>
            </Box>
          </Flex>

          <SectionSubheading pt={6}>Letter Spacing</SectionSubheading>

          <p>
            Letterspacing (also known as character spacing or tracking) is the
            adjustment of the horizontal white space between the letters in a
            block of text. Tokens are intended for use with the{` `}
            <code>letter-spacing</code> CSS property.
          </p>

          <ExampleBox pt={8}>
            <Text as="p" mb={0}>
              <strong>Normal</strong> — <code>letterSpacings.normal</code> —
              {` `}
              <code>{letterSpacings.normal}</code>
            </Text>
            <p>Use for almost everything.</p>
          </ExampleBox>

          <hr />

          <ExampleBox>
            <Text as="p" mb={0}>
              <strong>Tight</strong> — <code>letterSpacings.tight</code> —{` `}
              <code>{letterSpacings.tight}</code>
            </Text>
            <p>Use for headlines set in Futura PT.</p>
            <Heading lineHeight="solid" pb={8}>
              Create digital experiences on the edge—faster
            </Heading>
          </ExampleBox>

          <hr />

          <ExampleBox>
            <Text as="p" mb={0}>
              <strong>Tracked</strong> — <code>letterSpacings.tracked</code> —
              {` `}
              <code>{letterSpacings.tracked}</code>
            </Text>
            <p>
              Use for small caps, particularly at small sizes — when using
              capital letters together, the default spacing looks too tight.
            </p>
            <Text
              color="textMuted"
              fontFamily="heading"
              fontSize={1}
              letterSpacing="tracked"
              pb={8}
              css={{
                textTransform: `uppercase`,
              }}
            >
              greglobinski
            </Text>
          </ExampleBox>

          <SectionSubheading pt={6}>Line Heights</SectionSubheading>

          <ExampleBox>
            <Text as="p" mb={0}>
              <strong>Default</strong> — <code>lineHeights.default</code> —{` `}
              <code>{lineHeights.default}</code>
            </Text>
            <Text as="p" lineHeight="default" pb={8} pt={4}>
              It eluded us then, but that’s no matter—tomorrow we will run
              faster, stretch out our arms farther. . . . And then one fine
              morning— So we beat on, boats against the current, borne back
              ceaselessly into the past.
            </Text>
          </ExampleBox>

          <hr />

          <ExampleBox>
            <Text as="p" mb={0}>
              <strong>Solid</strong> — <code>lineHeights.solid</code> —{` `}
              <code>{lineHeights.solid}</code>
            </Text>
            <Heading pb={8} pt={4} lineHeight="solid">
              Scale to the entire internet
            </Heading>
          </ExampleBox>

          <hr />

          <ExampleBox>
            <Text as="p" mb={0}>
              <strong>Dense</strong> — <code>lineHeights.dense</code> —{` `}
              <code>{lineHeights.dense}</code>
            </Text>
            <Heading pb={8} pt={4} fontWeight="heading">
              Stop managing content.
              <br />
              Start telling your story.
            </Heading>
          </ExampleBox>

          <hr />

          <ExampleBox>
            <Text as="p" mb={0}>
              <strong>Loose</strong> — <code>lineHeights.loose</code> —{` `}
              <code>{lineHeights.loose}</code>
            </Text>
            <Intro lineHeight="loose" pb={8} pt={4} mb={0}>
              As a popular and growing framework for building websites and web
              applications, Gatsby is in a position to make an impact for
              accessibility and people with disabilities. The Gatsby team is
              passionate about helping you create websites that work for
              everyone, with helpful defaults that bake in web accessibility as
              well as performance optimizations.
            </Intro>
          </ExampleBox>
        </ContentColumn>
      </Columns>
    </Section>
    <Section>
      <h2>Sample hierarchies</h2>
      <Columns>
        <CopyColumn>
          <p>
            A couple of usage examples — currently, these are rough PoC-style
            {` `}
            <a href="https://styled-system.com/">styled-system</a> remodels of
            components used on our website. Ideally, this section will be built
            using these "live" components.
          </p>
        </CopyColumn>
        <ContentColumn>
          <Box maxWidth="35rem">
            <Text
              as="p"
              fontFamily="heading"
              fontWeight={0}
              fontSize={4}
              mb={4}
              letterSpacing="tracked"
              css={{
                textTransform: `uppercase`,
              }}
            >
              The Future is Fast
            </Text>
            <Heading
              fontSize={{ xxs: 9, sm: 12, lg: 13 }}
              letterSpacing="tight"
              lineHeight="solid"
              mb={5}
            >
              Create digital experiences on the edge—faster
            </Heading>
            <Heading as="h2" mb={8} fontSize={6} fontWeight="heading">
              Gatsby provides a modern framework for turning content into
              feature-rich, visually engaging apps and websites.
            </Heading>
            <Text fontSize={{ xxs: 2, md: 3 }} mb={7}>
              <p>
                Over the last few years, the modern JavaScript ecosystem has
                created tools that allow developers to build quicker with fewer
                bugs. Gatsby gives you easy access to features like modern
                JavaScript syntax, code bundling and hot reloading, without
                having to maintain custom tooling. Build app-like experiences
                faster — with Gatsby.
              </p>
              <p>
                Websites come in a thousand different flavors. Timeframes,
                budgets, interactivity requirements and content systems can vary
                wildly from one project to the next.
              </p>
              <p>
                This variety puts website teams between a rock and a hard place.
                They often have to maintain frontends built in multiple
                development systems, stretching their developers’ skill sets.
                Implementing the same dropdown in five different frameworks can
                be a huge headache. But what’s the alternative — turn down good
                client projects?
              </p>
              <p>
                To add to the difficulty, when your UI development framework is
                coupled to your client’s CMS backend, it doesn’t just cause
                technical problems; it causes people problems. It makes your
                team’s staffing plans dependent on specific projects. It
                hamstrings your ability to respond to changing client
                requirements by shifting resources around.
              </p>
            </Text>
            <Button>Read more</Button>
          </Box>
        </ContentColumn>
      </Columns>
    </Section>

    <Container py={8} my={8} textAlign="center">
      <Text fontSize={1}>Simple landing page</Text>

      <Box maxWidth={1040} mx="auto">
        <PageHeading
          fontSize={{ md: 11 }}
          lineHeight="solid"
          maxWidth="48rem"
          mb={3}
          mx="auto"
        >
          Stop managing content.
          <br /> Start telling your story.
        </PageHeading>
        <Intro maxWidth="40rem" mx="auto" mb={6}>
          Gatsby brings your content to the edge for lightning fast, safe
          website delivery with no CMS overhead.
        </Intro>
        <Button mx="auto" mb={4}>
          Start a free trial
        </Button>
        <Text fontSize={1}>14 day free trial — no credit card required</Text>

        <Box display={{ md: `flex ` }} mt={12} pb={12} textAlign="left">
          <MarketingColumn title="Modern web tech without the headache">
            Enjoy the power of the latest web technologies – React.js , Webpack
            , modern JavaScript and CSS and more — all set up and waiting for
            you to start building.
          </MarketingColumn>
          <MarketingColumn title="Bring your own data">
            Gatsby’s rich data plugin ecosystem lets you build sites with the
            data you want — pull data from headless CMSs, SaaS services, APIs,
            databases, your file system, and more.
          </MarketingColumn>
        </Box>
        <Box display={{ md: `flex ` }} pb={12} textAlign="left">
          <MarketingColumn title="Future-proof your website">
            Do not build a website with last decade’s tech. The future of the
            web is mobile, JavaScript and APIs—the JAMstack. Every website is a
            web app and every web app is a website. Gatsby.js is the universal
            JavaScript framework you’ve been waiting for.
          </MarketingColumn>
          <MarketingColumn title="Scale to the entire internet">
            Forget complicated deploys with databases and servers and their
            expensive, time-consuming setup costs, maintenance, and scaling
            fears — Gatsby builds your site as “static” files which can be
            deployed easily on various services.
          </MarketingColumn>
        </Box>
        <Box display={{ md: `flex ` }} pb={12} textAlign="left">
          <MarketingColumn title="Speed past the competition">
            Gatsby.js builds the fastest possible website. Instead of waiting to
            generate pages when requested, pre-build pages and lift them into a
            global cloud of servers — ready to be delivered instantly to your
            users wherever they are.
          </MarketingColumn>
          <MarketingColumn title="Static Progressive Web Apps">
            Gatsby.js is a static PWA (Progressive Web App) generator. You get
            code and data splitting out-of-the-box. Gatsby loads only the
            critical HTML, CSS, data, and JavaScript so your site loads as fast
            as possible. Once loaded, Gatsby prefetches resources for other
            pages so clicking around the site feels incredibly fast.
          </MarketingColumn>
        </Box>
      </Box>
    </Container>

    <Container>
      <Box bt={1} py={8} my={8}>
        <Text color="grey.60" fontSize={1} textAlign="center">
          Cards
        </Text>
        <Flex mt={7} flexWrap="wrap" justifyContent="space-around">
          <Starter mx={6} />
          <Blog mx={6} />
        </Flex>
      </Box>
    </Container>

    <Container>
      <Text color="grey.60" fontSize={1} textAlign="center">
        Long-form text (with sidebar on large screens)
      </Text>
      <Flex as="section" py={4} my={4}>
        <Box mt={8} mr="auto" pr={7} display={{ xxs: `none`, md: `block` }}>
          <Box
            sx={{
              borderRightWidth: 1,
              borderRightStyle: `solid`,
              borderColor: `ui.border`,
            }}
            pr={7}
          >
            <Heading fontWeight="heading" fontSize={3} mb={5}>
              Documentation
            </Heading>
            <SidebarUL>
              {[`Introduction`, `Quickstart`, `Recipes`].map((item, index) => (
                <SidebarLI key={`sidebar-item-1-${index}`}>{item}</SidebarLI>
              ))}
            </SidebarUL>
            <Heading fontWeight="heading" fontSize={3} mt={8} mb={5}>
              Guides
            </Heading>
            <SidebarUL>
              {[
                `Preparing your environment`,
                `Deploying & hosting`,
                `Custom configuration`,
                `Images and files`,
                `Sourcing content and data`,
                `Querying your data with GraphQl`,
                `Plugins`,
                `Starters`,
                `Styling your site`,
                `Adding testing`,
                `Debugging Gatsby`,
                `Adding website functionality`,
                `Improving performance`,
                `Localizing your site`,
              ].map((item, index) => (
                <SidebarLI key={`sidebar-item-2-${index}`}>{item}</SidebarLI>
              ))}
            </SidebarUL>
          </Box>
        </Box>

        <Box maxWidth="48rem" mx="auto" css={{ minWidth: `0` }}>
          <PageHeading
            fontSize={{ md: 11 }}
            lineHeight="solid"
            maxWidth="40rem"
            mb={7}
          >
            How we're migrating a government open data site to Gatsby
          </PageHeading>

          <Text
            fontSize={{ xxs: 2, md: 3, lg: 4 }}
            color="black.50"
            fontWeight="body"
            // fontFamily="serif"
          >
            <ImagePlaceholder mb={4} />
            <p>
              React Hooks are <em>cool</em>. Besides simplifying your code and
              removing the need for a lot of boilerplate associated with classes
              in JavaScript (looking at you, <code>this</code>), they enable
              some serious shareability. They also make it possible to use state
              in functional components.
            </p>
            <p>
              You can probably tell that we’ve been super excited about{` `}
              <Link href="https://reactjs.org/docs/hooks-intro.html">
                React Hooks
              </Link>
              . So when they finally landed in React 16.8, we figured it was
              time to give our very own{` `}
              <code>StaticQuery</code>
              {` `}
              component the hook treatment!
            </p>
            <Heading as="h2" fontSize={{ xxs: 3, md: 6, lg: 7 }} mt={6} mb={4}>
              Baking PWAs, React and GraphQL into a web framework
            </Heading>
            <p>
              One of Gatsby’s goals is to provider users all the benefits of
              modern web out of the box, from implementing a Progressive Web App
              (PWA) checklist of features, React, accessibility by default,
              CSS-in-JS support, headless CMSs, and GraphQL.
            </p>
            <p>
              <strong>
                No more Render Props necessary to use a Static Query
              </strong>
            </p>
            <p>
              This simplifies accessing data in your components and also keeps
              your component tree shallow.
            </p>
            <p>
              Let’s quickly check out a basic example. Here’s a typical Header
              component, first written using{` `}
              <code>StaticQuery</code>
              {` `}
              and then{` `}
              <code>useStaticQuery</code>.
            </p>
            <Box
              bg="grey.10"
              color="grey.80"
              p={5}
              my={6}
              fontSize={{ xxs: 1, md: 2 }}
            >
              💡 For a great introduction to using the command line, check out
              {` `}
              <a href="https://www.codecademy.com/courses/learn-the-command-line/lessons/navigation/exercises/your-first-command">
                Codecademy’s Command Line tutorial
              </a>
              {` `}
              for Mac and Linux users, and this tutorial for Windows users. Even
              if you are a Windows user, the first page of the Codecademy
              tutorial is a valuable read.
            </Box>
          </Text>
        </Box>
      </Flex>
    </Container>
  </Layout>
)

export default Typography
