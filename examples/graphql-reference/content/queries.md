# Queries

## Basic query

```graphql
{
  site {
    siteMetadata {
      title
    }
  }
}
```

## A longer query

```graphql
{
  allSitePlugin {
    totalCount
    edges {
      node {
        name
        version
        packageJson {
          description
        }
      }
    }
  }
}
```

## Limit

```graphql
{
  allMarkdownRemark(limit: 2) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}
```

## Skip

```graphql
{
  allMarkdownRemark(skip: 3) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}
```

## Filter

```graphql
{
  allMarkdownRemark(filter: { frontmatter: { title: { ne: "" } } }) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}
```

## Sort

```graphql
{
  allMarkdownRemark(sort: { frontmatter: { date: ASC } }) {
    totalCount
    edges {
      node {
        frontmatter {
          title
          date
        }
      }
    }
  }
}
```

## Format

```graphql
{
  allMarkdownRemark(filter: { frontmatter: { date: { ne: null } } }) {
    edges {
      node {
        frontmatter {
          title
          date(formatString: "dddd DD MMMM YYYY")
        }
      }
    }
  }
}
```

## Sort, Filter, Limit, Format

```graphql
{
  allMarkdownRemark(
    limit: 3
    filter: { frontmatter: { date: { ne: null } } }
    sort: { frontmatter: { date: DESC } }
  ) {
    edges {
      node {
        fields {
          slug
        }
        frontmatter {
          title
          date(formatString: "dddd DD MMMM YYYY")
        }
      }
    }
  }
}
```

## Query Variables

```graphql
query GetBlogPosts($limit: Int, $filter: filterMarkdownRemark, $sort: markdownRemarkConnectionSort) {
  allMarkdownRemark(
    limit: $limit,
    filter: $filter,
    sort: $sort
  ) {
    edges {
      node {
        fields{
          slug
        }
        frontmatter {
          title
          date(formatString: "dddd DD MMMM YYYY")
        }
      }
    }
  }
}

{
  "limit": 3,
  "filter": {
    "frontmatter": {
      "date": {
        "ne": null
      }
    }
  },
  "sort": {
    "frontmatter": {
      "date": "DESC"
    }
  }
}
```

## Group

```graphql
{
  allMarkdownRemark {
    group(field: frontmatter___author) {
      fieldValue
      totalCount
      edges {
        node {
          frontmatter {
            title
          }
        }
      }
    }
  }
}
```

## Fragments

```graphql
fragment fragName on Site {
  siteMetadata {
    title
  }
}

{
  site {
    ...fragName
  }
}
```

## Aliasing

```graphql
{
  someEntries: allMarkdownRemark(skip: 3, limit: 3) {
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
  someMoreEntries: allMarkdownRemark(limit: 3) {
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}
```
