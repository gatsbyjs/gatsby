export const ExampleFragment = graphql`fragment Example on ContentfulContentTypeFoo {
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
      ... on Example {
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
