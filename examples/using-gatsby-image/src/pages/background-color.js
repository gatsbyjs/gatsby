import React from "react"
import Img from "gatsby-image"

import { rhythm, options } from "../utils/typography"

const BlurUp = ({ data }) => (
  <div>
    <h1>Viribus quid</h1>
    <h2>Hippason sinu</h2>
    <Img
      css={{
        marginBottom: rhythm(options.blockMarginBottom),
        marginLeft: rhythm(options.blockMarginBottom),
        float: `right`,
        "@media (min-width: 500px)": {
          display: `none`,
        },
      }}
      backgroundColor={`lightgray`}
      title={`Photo by Redd Angelo on Unsplash`}
      responsiveResolution={data.reddImageMobile.responsiveResolution}
    />
    <Img
      css={{
        marginBottom: rhythm(options.blockMarginBottom),
        marginLeft: rhythm(options.blockMarginBottom),
        float: `right`,
        display: `none`,
        "@media (min-width: 500px)": {
          display: `block`,
        },
      }}
      backgroundColor={`lightgray`}
      title={`Photo by Redd Angelo on Unsplash`}
      responsiveResolution={data.reddImage.responsiveResolution}
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
      responsiveSizes={data.kenImage.responsiveSizes}
      backgroundColor={`lightgray`}
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
  </div>
)

export default BlurUp

export const query = graphql`
  query BackgroundColorQuery {
    reddImageMobile: imageSharp(id: { regex: "/redd/" }) {
      responsiveResolution(width: 126) {
        aspectRatio
        width
        height
        src
        srcSet
      }
    }
    reddImage: imageSharp(id: { regex: "/redd/" }) {
      responsiveResolution(width: 201) {
        aspectRatio
        width
        height
        src
        srcSet
      }
    }
    kenImage: imageSharp(id: { regex: "/ken-treloar/" }) {
      responsiveSizes(maxWidth: 599) {
        aspectRatio
        src
        srcSet
        sizes
        originalImg
        originalName
      }
    }
  }
`
