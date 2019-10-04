import React from "react"

import { colors } from "../../utils/presets"
import { WebpackIcon, ReactJSIcon, GraphQLIcon } from "../../assets/tech-logos"
import Card from "../card"
import CardHeadline from "../card-headline"
import TechWithIcon from "../tech-with-icon"
import FuturaParagraph from "../futura-paragraph"

const HomepageFeatures = () => (
  <div
    css={{
      display: `flex`,
      flex: `0 1 auto`,
      flexWrap: `wrap`,
      borderBottom: `1px solid ${colors.purple[10]}`,
    }}
  >
    <Card>
      <CardHeadline>Modern web tech without the headache</CardHeadline>
      <FuturaParagraph>
        Enjoy the power of the latest web technologies –{` `}
        <TechWithIcon icon={ReactJSIcon}>React.js</TechWithIcon>,{` `}
        <TechWithIcon icon={WebpackIcon}>Webpack</TechWithIcon>,{` `}
        modern JavaScript and CSS and more — all set up and waiting for you to
        start building.
      </FuturaParagraph>
    </Card>
    <Card>
      <CardHeadline>Bring your own data</CardHeadline>
      <FuturaParagraph>
        Gatsby’s rich data plugin ecosystem lets you build sites with the data
        you want — from one or many sources: Pull data from headless CMSs, SaaS
        services, APIs, databases, your file system, and more directly into your
        pages using
        {` `}
        <TechWithIcon icon={GraphQLIcon}>GraphQL</TechWithIcon>.
      </FuturaParagraph>
    </Card>
    <Card>
      <CardHeadline>Scale to the entire internet</CardHeadline>
      <FuturaParagraph>
        Gatsby.js is Internet Scale. Forget complicated deploys with databases
        and servers and their expensive, time-consuming setup costs,
        maintenance, and scaling fears. Gatsby.js builds your site as “static”
        files which can be deployed easily on dozens of services.
      </FuturaParagraph>
    </Card>
    <Card>
      <CardHeadline>Future-proof your website</CardHeadline>
      <FuturaParagraph>
        Do not build a website with last decade’s tech. The future of the web is
        mobile, JavaScript and APIs—the {` `}
        <a href="https://jamstack.org/">JAMstack</a>. Every website is a web app
        and every web app is a website. Gatsby.js is the universal JavaScript
        framework you’ve been waiting for.
      </FuturaParagraph>
    </Card>
    <Card>
      <CardHeadline>
        <em css={{ color: colors.gatsby, fontStyle: `normal` }}>Static</em>
        {` `}
        Progressive Web Apps
      </CardHeadline>
      <FuturaParagraph>
        Gatsby.js is a static PWA (Progressive Web App) generator. You get code
        and data splitting out-of-the-box. Gatsby loads only the critical HTML,
        CSS, data, and JavaScript so your site loads as fast as possible. Once
        loaded, Gatsby prefetches resources for other pages so clicking around
        the site feels incredibly fast.
      </FuturaParagraph>
    </Card>
    <Card>
      <CardHeadline>Speed past the competition</CardHeadline>
      <FuturaParagraph>
        Gatsby.js builds the fastest possible website. Instead of waiting to
        generate pages when requested, pre-build pages and lift them into a
        global cloud of servers — ready to be delivered instantly to your users
        wherever they are.
      </FuturaParagraph>
    </Card>
  </div>
)

export default HomepageFeatures
