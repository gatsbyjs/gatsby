const result = graphql(`
query {
    file(relativePath: { eq: "headers/headshot.jpg" }) {
      childImageSharp {
        fluid {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
  `)