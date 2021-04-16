import Img from "gatsby-image"
const HomePage = ({ data }) => {
  const pageTitle = 'LAURIE ON TECH Homepage'
  const image = data.file.childImageSharp.fluid
  return (
    <Layout>
      <section id="about" className=" special wrapper container style4">
        <h2 className="hs h2">ABOUT LAURIE</h2>
        <Img
          className="headshot"
          fluid={image}
          alt="headshot"
        />
      </section>
    </Layout>
  )
}