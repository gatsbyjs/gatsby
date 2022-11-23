import { GatsbyImage } from "gatsby-plugin-image";
const HomePage = ({ data }) => {
  const pageTitle = 'LAURIE ON TECH Homepage'
  const image = data.file.childImageSharp.gatsbyImageData
  return (
    <Layout>
      <section id="about" className=" special wrapper container style4">
        <h2 className="hs h2">ABOUT LAURIE</h2>
        <GatsbyImage image={image} className="headshot" alt="headshot" />
      </section>
    </Layout>
  );
}