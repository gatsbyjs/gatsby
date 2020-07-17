export const PAGES_QUERY = `
  query GetPages($first: Int!, $after: String) {
    pages(first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          handle
          title
          body
          bodySummary
          updatedAt
          url
        }
      }
    }
  }
`

export const defaultQueries = {
  articles: `
  query GetArticles($first: Int!, $after: String) {
    articles(first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          author {
            bio
            email
            firstName
            lastName
            name
          }
          blog {
            id
          }
          comments(first: 250) {
            edges {
              node {
                author {
                  email
                  name
                }
                content
                contentHtml
                id
              }
            }
          }
          content
          contentHtml
          excerpt
          excerptHtml
          handle
          id
          handle
          image {
            altText
            id
            src
          }
          publishedAt
          tags
          title
          url
          seo {
            title
            description
          }
        }
      }
    }
  }
`,
  blogs: `
  query GetBlogs($first: Int!, $after: String) {
    blogs(first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          handle
          id
          handle
          title
          url
        }
      }
    }
  }
`,
  collections: `
  query GetCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          description
          descriptionHtml
          handle
          id
          image {
            altText
            id
            src
          }
          products(first: 250) {
            edges {
              node {
                id
              }
            }
          }
          title
          updatedAt
        }
      }
    }
  }
`,
  products: `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          availableForSale
          createdAt
          description
          descriptionHtml
          handle
          id
          images(first: 250) {
            edges {
              node {
                id
                altText
                originalSrc
              }
            }
          }
          metafields(first: 250) {
            edges {
              node {
                description
                id
                key
                namespace
                value
                valueType
              }
            }
          }
          onlineStoreUrl
          options {
            id
            name
            values
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          productType
          publishedAt
          tags
          title
          updatedAt
          variants(first: 250) {
            edges {
              node {
                availableForSale
                compareAtPrice
                compareAtPriceV2 {
                  amount
                  currencyCode
                }
                id
                image {
                  altText
                  id
                  originalSrc
                }
                metafields(first: 250) {
                  edges {
                    node {
                      description
                      id
                      key
                      namespace
                      value
                      valueType
                    }
                  }
                }
                price
                priceV2 {
                  amount
                  currencyCode
                }
                requiresShipping
                selectedOptions {
                  name
                  value
                }
                sku
                title
                weight
                weightUnit
                presentmentPrices(first: 250) {
                  edges {
                    node {
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
          vendor
        }
      }
    }
  }
`,
  shopPolicies: `
  query GetPolicies {
    shop {
      privacyPolicy {
        body
        handle
        id
        title
        url
      }
      refundPolicy {
        body
        handle
        id
        title
        url
      }
      termsOfService {
        body
        handle
        id
        title
        url
      }
    }
  }
`,
  pages: PAGES_QUERY,
}
