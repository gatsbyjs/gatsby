---
title: Inferring Input Filters
---

## Input Filters vs gqlType

In [gqlTypes](/docs/schema-gql-type), we inferred a Gatsby Node's main fields. These allow us to query a node's children, parent and object fields. But these are only useful once a top level GraphQL Query has returned results. In order to query by those fields, we must create GraphQL objects for input filters. E.g, querying for all markdownRemark nodes that have 4 paragraphs.

```graphql
{
  markdownRemark(wordCount: { paragraphs: { eq: 4 } }) {
    html
  }
}
```

The arguments (`wordcount: {paragraphs: {eq: 4}}`) to the query are known as Input filters. In graphql-js, they are the [GraphQLInputObjectType](https://graphql.org/graphql-js/type/#graphqlinputobjecttype). This section covers how these Input filters are inferred.

### Inferring input filters from example node values

The first step is to generate an input field for each type of field on the redux nodes. For example, we might want to query markdown nodes by their front matter author:

```graphql
{
  markdownRemark(frontmatter: { author: { eq: "F. Scott Fitzgerald" } }) {
    id
  }
}
```

This step is handled by [inferInputObjectStrctureFromNodes](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/schema/infer-graphql-input-fields.js#L235). First, we generate an example Value (see [gqlTypes](/docs/schema-gql-type#gqltype-creation)). For each field on the example value (e.g `author`), we create a [GraphQLInputObjectType](https://graphql.org/graphql-js/type/#graphqlinputobjecttype) with an appropriate name. The fields for Input Objects are predicates that depend on the value's `typeof` result. E.g for a String, we need to be able to query by `eq`, `regex` etc. If the value is an object itself, then we recurse, building its fields as above.

If the key is a foreign key reference (ends in `___NODE`), then we find the field's linked Type first, and progress as above (for more on how foreign keys are implemented, see [gqlType](/docs/schema-gql-type#foreign-key-reference-___node)). After this step, we will end up with an Input Object type such as .

```javascript
{
  `MarkdownRemarkFrontmatterAuthor`: {
    name: `MarkdownRemarkFrontmatterAuthorInputObject`,
    fields: {
      `MarkdownRemarkFrontmatterAuthorName` : {
        name: `MarkdownRemarkFrontmatterAuthorNameQueryString`,
        fields: {
          eq: { type: GraphQLString },
          ne: { type: GraphQLString },
          regex: { type: GraphQLString },
          glob: { type: GraphQLString },
          in: { type: new GraphQLList(GraphQLString) },
        }
      }
    }
  }
}
```

### Inferring input filters from plugin fields

Plugins themselves have the opportunity to create custom fields that apply to ALL nodes of a particular type, as opposed to having to explicitly add the field on every node creation. An example would be `markdownRemark` which adds a `wordcount` field to each node automatically. This section deals with the generation of input filters so that we can query by these fields as well. E.g:

```graphql
{
  markdownRemark(wordCount: { paragraphs: { eq: 4 } }) {
    html
  }
}
```

Plugins add custom fields by implementing the [setFieldsOnGraphQLNodeType](/docs/node-apis/#setFieldsOnGraphQLNodeType) API. They must return a full GraphQLObjectType, complete with `resolve` function. Once this API has been run, the fields are passed to [inferInputObjectStructureFromFields](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/schema/infer-graphql-input-fields-from-fields.js#L195), which will generate input filters for the new fields. The result would look something like:

```javascript
{ //GraphQLInputObjectType
  name: `WordCountwordcountInputObject`,
  fields: {
    `paragraphs`: {
      type: { // GraphQLInputObjectType
        name: `WordCountParagraphsQueryInt`,
        fields: {
          eq: { type: GraphQLInt },
          ne: { type: GraphQLInt },
          gt: { type: GraphQLInt },
          gte: { type: GraphQLInt },
          lt: { type: GraphQLInt },
          lte: { type: GraphQLInt },
          in: { type: new GraphQLList(GraphQLInt) },
        }
      }
    }
  }
}
```

As usual, the input filter fields (`eq`, `lt`, `gt`, etc) are based on the type of the field (`Int` in this case), which is defined by the plugin.

### Merged result

Now that we've generated input fields from the redux nodes and from custom plugin fields, we merge them together. E.g

```javascript
{

  // from infer input fields from object
  `MarkdownRemarkAuthor`: {
    name: `MarkdownRemarkAuthorInputObject`,
    fields: {
      `MarkdownRemarkAuthorName` : {
        name: `MarkdownRemarkAuthorNameQueryString`,
        fields: {
          eq: { type: GraphQLString },
          ne: { type: GraphQLString },
          regex: { type: GraphQLString },
          glob: { type: GraphQLString },
          in: { type: new GraphQLList(GraphQLString) },
        }
      }
    }
  },

  // From infer input fields from fields
  `wordCount`: { //GraphQLInputObjectType
    name: `WordCountwordcountInputObject`,
    fields: {
      `paragraphs`: {
        type: { // GraphQLInputObjectType
          name: `WordCountParagraphsQueryInt`,
          fields: {
            eq: { type: GraphQLInt },
            ne: { type: GraphQLInt },
            gt: { type: GraphQLInt },
            gte: { type: GraphQLInt },
            lt: { type: GraphQLInt },
            lte: { type: GraphQLInt },
            in: { type: new GraphQLList(GraphQLInt) },
          }
        }
      }
    }
  }
}
```
