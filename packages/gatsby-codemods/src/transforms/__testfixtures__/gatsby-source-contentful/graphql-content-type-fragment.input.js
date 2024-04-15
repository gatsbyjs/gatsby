export const ExampleFragment = graphql`
  fragment Example on ContentfulExample {
    title
    contentful_id
    logo {
      file {
        url
        fileName
        contentType
        details {
          size
          image {
            width
            height
          }
        }
      }
    }
  }
  {
    allContentfulFoo {
      nodes {
        ... on ContentfulExample {
          contentful_id
          logo {
            file {
              url
            }
          }
        }
      }
    }
  }
`