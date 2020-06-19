const { createContentDigest } = require(`gatsby-core-utils`)
const _ = require(`lodash`)
const slugify = require(`slugify`)
const moment = require(`moment`)
const url = require(`url`)
const { getMdxContentSlug } = require(`../get-mdx-content-slug`)
const { getTemplate } = require(`../get-template`)

const mdxResolverPassthrough = fieldName => async (
  source,
  args,
  context,
  info
) => {
  const type = info.schema.getType(`Mdx`)
  const mdxNode = context.nodeModel.getNodeById({
    id: source.parent,
  })
  const resolver = type.getFields()[fieldName].resolve
  const result = await resolver(mdxNode, args, context, {
    fieldName,
  })
  return result
}

exports.createSchemaCustomization = ({ schema, actions: { createTypes } }) => {
  createTypes(/* GraphQL */ `
    type AuthorYaml implements Node @derivedTypes @dontInfer {
      id: String!
      bio: String
      avatar: File @fileByRelativePath
      twitter: String
      fields: AuthorYamlFields!
    }

    type AuthorYamlFields @dontInfer {
      slug: String!
    }
  `)
  createTypes(
    schema.buildObjectType({
      name: `BlogPost`,
      fields: {
        id: { type: `ID!` },
        html: { type: `String`, resolve: mdxResolverPassthrough(`html`) },
        body: { type: `String`, resolve: mdxResolverPassthrough(`body`) },
        timeToRead: {
          type: `Int`,
          resolve: mdxResolverPassthrough(`timeToRead`),
        },
        slug: { type: `String!` },
        released: { type: `Boolean` },
        excerpt: { type: `String` },
        title: { type: `String!` },
        seoTitle: { type: `String` },
        draft: { type: `Boolean` },
        date: { type: `Date`, extensions: { dateformat: {} } },
        canonicalLink: { type: `String` },
        publishedAt: { type: `String` },
        tags: { type: `[String!]` },
        author: { type: `AuthorYaml`, extensions: { link: {} } },
        twittercard: { type: `String` },
        cover: { type: `File`, extensions: { fileByRelativePath: {} } },
        image: { type: `File`, extensions: { fileByRelativePath: {} } },
        imageAuthor: { type: `String` },
        imageAuthorLink: { type: `String` },
        imageTitle: { type: `String` },
        showImageInArticle: { type: `Boolean` },
      },
      interfaces: [`Node`],
      extensions: {
        infer: false,
        childOf: { types: [`Mdx`] },
      },
    })
  )
}

exports.onCreateNode = async ({ node, actions, getNode, createNodeId }) => {
  const { createNodeField, createNode, createParentChildLink } = actions
  if (node.internal.type === `AuthorYaml`) {
    createNodeField({
      node,
      name: `slug`,
      value: `/contributors/${slugify(node.id, { lower: true })}/`,
    })
  } else {
    const slug = getMdxContentSlug(node, getNode(node.parent))
    if (!slug) return
    const section = slug.split(`/`)[1]
    if (section !== `blog`) return

    const {
      draft,
      date,
      canonicalLink,
      publishedAt,
      excerpt,
    } = node.frontmatter

    const fieldData = {
      ...node.frontmatter,
      slug,
      html: node.html,
      body: node.body,
      timeToRead: node.timeToRead,
      released:
        !draft && !!date && moment.utc().isSameOrAfter(moment.utc(date)),
      publishedAt: canonicalLink
        ? publishedAt || url.parse(canonicalLink).hostname
        : null,
      excerpt: excerpt || node.excerpt,
    }

    const blogPostId = createNodeId(`${node.id} >>> BlogPost`)
    await createNode({
      ...fieldData,
      id: blogPostId,
      parent: node.id,
      children: [],
      internal: {
        type: `BlogPost`,
        contentDigest: createContentDigest(fieldData),
        content: JSON.stringify(fieldData),
        description: `A blog post`,
      },
    })
    createParentChildLink({ parent: node, child: getNode(blogPostId) })
  }
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPostTemplate = getTemplate(`template-blog-post`)
  const blogListTemplate = getTemplate(`template-blog-list`)
  const tagTemplate = getTemplate(`tags`)
  const contributorPageTemplate = getTemplate(`template-contributor-page`)

  const { data, errors } = await graphql(/* GraphQL */ `
    query {
      allAuthorYaml {
        nodes {
          id
          fields {
            slug
          }
        }
      }
      allBlogPost(
        sort: { order: DESC, fields: [date, slug] }
        limit: 10000
        filter: { draft: { ne: true } }
      ) {
        nodes {
          slug
          released
          title
          canonicalLink
          publishedAt
          tags
        }
      }
    }
  `)
  if (errors) throw errors

  // Create contributor pages.
  data.allAuthorYaml.nodes.forEach(node => {
    createPage({
      path: `${node.fields.slug}`,
      component: contributorPageTemplate,
      context: {
        authorId: node.id,
      },
    })
  })

  const blogPosts = data.allBlogPost.nodes

  const releasedBlogPosts = blogPosts.filter(post => post.released)

  // Create blog-list pages.
  const postsPerPage = 8
  const numPages = Math.ceil(releasedBlogPosts.length / postsPerPage)

  Array.from({
    length: numPages,
  }).forEach((_, i) => {
    createPage({
      path: i === 0 ? `/blog` : `/blog/page/${i + 1}`,
      component: blogListTemplate,
      context: {
        limit: postsPerPage,
        skip: i * postsPerPage,
        numPages,
        currentPage: i + 1,
      },
    })
  })

  // Create blog-post pages.
  blogPosts.forEach((node, index) => {
    let next = index === 0 ? null : blogPosts[index - 1]
    if (next && !next.released) next = null

    const prev = index === blogPosts.length - 1 ? null : blogPosts[index + 1]

    createPage({
      path: `${node.slug}`, // required
      component: blogPostTemplate,
      context: {
        slug: node.slug,
        prev: prev && {
          title: prev.title,
          link: prev.slug,
        },
        next: next && {
          title: next.title,
          link: next.slug,
        },
      },
    })
  })

  const makeSlugTag = tag => _.kebabCase(tag.toLowerCase())

  // Collect all tags and group them by their kebab-case so that
  // hyphenated and spaced tags are treated the same. e.g
  // `case-study` -> [`case-study`, `case study`]. The hyphenated
  // version will be used for the slug, and the spaced version
  // will be used for human readability (see templates/tags)
  const tagGroups = _(releasedBlogPosts)
    .map(post => _.get(post, `tags`))
    .filter()
    .flatten()
    .uniq()
    .groupBy(makeSlugTag)

  tagGroups.forEach((tags, tagSlug) => {
    createPage({
      path: `/blog/tags/${tagSlug}/`,
      component: tagTemplate,
      context: {
        tags,
      },
    })
  })
}
