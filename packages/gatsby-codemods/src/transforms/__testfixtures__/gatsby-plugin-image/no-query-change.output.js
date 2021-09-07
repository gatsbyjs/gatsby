const { bannerContentBlock, latestBlogPost } = useStaticQuery(graphql`
query MarketingBannerContent {
  bannerContentBlock: contentfulMarkdownContent(
    name: { eq: "Marketing Banner" }
  ) {
    __typename
    body {
      childMarkdownRemark {
        html
      }
    }
    contentfulid
    updatedAt
  }
  latestBlogPost: allWpPost(sort: { fields: date, order: DESC }, limit: 1) {
    nodes {
      title
      date
      slug
    }
  }
}
`)