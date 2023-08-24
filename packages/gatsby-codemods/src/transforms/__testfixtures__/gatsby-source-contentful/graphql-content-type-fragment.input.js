export const ExampleFragment = graphql`
  fragment Example on ContentfulFoo {
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
        ... on Example {
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