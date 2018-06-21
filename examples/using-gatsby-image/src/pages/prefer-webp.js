import React from "react"
import Img from "gatsby-image"

import Layout from "../layouts"
import { rhythm, options } from "../utils/typography"

const PreferWebp = ({ data, location }) => (
  <Layout location={location}>
    <h2>Prefer WebP</h2>
    <Img
      style={{ display: `inherit` }}
      css={{
        marginBottom: rhythm(options.blockMarginBottom),
        marginLeft: rhythm(options.blockMarginBottom),
        float: `right`,
        "&": {
          "@media (min-width: 500px)": {
            display: `none`,
          },
        },
      }}
      title={`Photo by Redd Angelo on Unsplash`}
      fixed={data.reddImageMobile.childImageSharp.fixed}
    />
    <Img
      style={{ display: `inherit` }}
      css={{
        marginBottom: rhythm(options.blockMarginBottom),
        marginLeft: rhythm(options.blockMarginBottom),
        float: `right`,
        display: `none`,
        "@media (min-width: 500px)": {
          display: `inline-block`,
        },
      }}
      title={`Photo by Redd Angelo on Unsplash`}
      fixed={data.reddImage.childImageSharp.fixed}
    />
    <p>
      Lorem markdownum nocens, est aut tergo, inmansuetique bella. Neve illud
      contrarius ad es prior.{` `}
      <a href="http://nunc.io/fuit.html">Planguntur</a> quondam, sua ferunt
      uterum semina advertere si fraudesque terram hosti subiecta, nec. Audenti
      refugitque manibusque aliis infelicem sed mihi aevis! Que ipso templa; tua
      triformis animumque ad coluit in aliquid.
    </p>
    <ul>
      <li>Infamia lumina sequuntur ulla</li>
      <li>Aquarum rutilos</li>
      <li>Hinc vimque</li>
    </ul>
    <h2>Et solebat pectus fletus erat furit officium</h2>
    <p>
      Proteus ut dis nec exsecrantia data: agrestes, truculenta Peleus. Et
      diffidunt, talia intravit Thaumantias; figere et <em>et</em> qui socio
      qui, <a href="http://vixmonet.io/in.html">tuo servet unda</a> hoc{` `}
      <strong>classi</strong>? Causam <em>quemque</em>? Subigebant cornibus
      fibras ut per nare nati, cunctis et <strong>illa verba</strong> inrita.
    </p>
    <ol>
      <li>Furori adacto</li>
      <li>Nocent imagine precari id ante sic</li>
      <li>Ipsos sine Iuno placabitis silet relinquent blandarum</li>
      <li>Et pars tabe sociorum et luna illum</li>
      <li>Et frustra pestifero et inquit cornua victa</li>
      <li>Constitit nomine senta suspirat et signis genuisse</li>
    </ol>
    <Img
      fluid={data.kenImage.childImageSharp.fluid}
      title={`Photo by Ken Treloar on Unsplash`}
    />
    <h2>Levia mihi</h2>
    <p>
      Precor Ortygiam, prudens diro stabant prodis moenia; aut tergo{` `}
      <a href="http://orehaec.io/">loquax et data</a> sua rite in vulnere. Esse
      lumina plaustrum lacus necopina, iam umbrae nec clipeo sentit{` `}
      <a href="http://ut.org/hinc">sinistra</a>.
    </p>
    <p>
      Pendebat nitidum vidistis ecce crematisregia fera et lucemque crines.{` `}
      <a href="http://www.sub.net/">Est sopita satis</a> quod harena
      Antimachumque tulit fusile. Fieri qui que prosit equidem, meis praescia
      monebat cacumina tergo acerbo saepe nullaque.
    </p>
  </Layout>
)

export default PreferWebp

export const query = graphql`
  query PreferWebpQuery {
    reddImageMobile: file(relativePath: { regex: "/redd/" }) {
      childImageSharp {
        fixed(width: 125) {
          ...GatsbyImageSharpFixed_withWebp
        }
      }
    }
    reddImage: file(relativePath: { regex: "/redd/" }) {
      childImageSharp {
        fixed(width: 200) {
          ...GatsbyImageSharpFixed_withWebp
        }
      }
    }
    kenImage: file(relativePath: { regex: "/ken-treloar/" }) {
      childImageSharp {
        fluid(maxWidth: 600) {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
  }
`
