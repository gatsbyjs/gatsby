export const ExampleFragment = graphql`fragment Example on ContentfulContentTypeExample {
  title
  sys {
    id
  }
  logo {
    url
    fileName
    contentType
    size
    width
    height
  }
}

{
  allContentfulContentTypeFoo {
    nodes {
      ... on ContentfulContentTypeExample {
        sys {
          id
        }
        logo {
          url
        }
      }
    }
  }
}`
