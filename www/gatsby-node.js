const _ = require(`lodash`)
const Promise = require(`bluebird`)
const path = require(`path`)
const fs = require(`fs-extra`)
const slash = require(`slash`)
const slugify = require(`slugify`)
const url = require(`url`)
const getpkgjson = require(`get-package-json-from-github`)
const parseGHUrl = require(`parse-github-url`)
const { GraphQLClient } = require(`graphql-request`)
const moment = require(`moment`)
const startersRedirects = require(`./starter-redirects.json`)
const {
  generateComparisonPageSet,
} = require(`./src/utils/generate-comparison-page-set.js`)
const yaml = require(`js-yaml`)
const docLinksData = yaml.load(
  fs.readFileSync(`./src/data/sidebars/doc-links.yaml`)
)
const tutorialLinksData = yaml.load(
  fs.readFileSync(`./src/data/sidebars/tutorial-links.yaml`)
)
const contributingLinksData = yaml.load(
  fs.readFileSync(`./src/data/sidebars/contributing-links.yaml`)
)

let ecosystemFeaturedItems

if (
  process.env.gatsby_executing_command === `build` &&
  !process.env.GITHUB_API_TOKEN
) {
  throw new Error(
    `A GitHub token is required to build the site. Check the README.`
  )
}

// used to gather repo data on starters
const githubApiClient = process.env.GITHUB_API_TOKEN
  ? new GraphQLClient(`https://api.github.com/graphql`, {
      headers: {
        authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
      },
    })
  : null

const localPackages = `../packages`
const localPackagesArr = []
fs.readdirSync(localPackages).forEach(file => {
  localPackagesArr.push(file)
})
// convert a string like `/some/long/path/name-of-docs/` to `name-of-docs`
const slugToAnchor = slug =>
  slug
    .split(`/`) // split on dir separators
    .filter(item => item !== ``) // remove empty values
    .pop() // take last item

exports.createPages = ({ graphql, actions, reporter }) => {
  const { createPage, createRedirect } = actions

  createRedirect({
    fromPath: `/docs/themes/api-reference`,
    toPath: `/docs/theme-api/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/component-css/`, // Merged Component CSS and CSS Modules
    toPath: `/docs/css-modules/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/blog/2018-10-25-unstructured-data/`,
    toPath: `/blog/2018-10-25-using-gatsby-without-graphql/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/using-unstructured-data/`,
    toPath: `/docs/using-gatsby-without-graphql/`,
    isPermanent: true,
  })

  // Random redirects
  createRedirect({
    fromPath: `/blog/2018-02-26-documentation-project/`, // Tweeted this link out then switched it
    toPath: `/blog/2018-02-28-documentation-project/`,
    isPermanent: true,
  })

  // Redirects for new top-level Contributing section
  createRedirect({
    fromPath: `/community/`, // Moved "Community" page from /community to /contributing/community
    toPath: `/contributing/community/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/community/`, // Moved "Community" page from /docs/community to /contributing/community
    toPath: `/contributing/community/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/deploying-to-now/`,
    toPath: `/docs/deploying-to-zeit-now/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/pair-programming/`,
    toPath: `/contributing/pair-programming/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/how-to-create-an-issue/`,
    toPath: `/contributing/how-to-create-an-issue/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/how-to-label-an-issue/`,
    toPath: `/contributing/how-to-label-an-issue/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/contributor-swag/`,
    toPath: `/contributing/contributor-swag/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/how-to-run-a-gatsby-workshop/`,
    toPath: `/contributing/how-to-run-a-gatsby-workshop/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/how-to-pitch-gatsby/`,
    toPath: `/contributing/how-to-pitch-gatsby/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/code-of-conduct/`,
    toPath: `/contributing/code-of-conduct/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/gatsby-style-guide/`,
    toPath: `/contributing/gatsby-style-guide/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/how-to-contribute/`,
    toPath: `/contributing/how-to-contribute/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/templates/`,
    toPath: `/contributing/docs-templates/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/site-showcase-submissions/`,
    toPath: `/contributing/site-showcase-submissions/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/submit-to-creator-showcase/`,
    toPath: `/contributing/submit-to-creator-showcase/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/submit-to-starter-library/`,
    toPath: `/contributing/submit-to-starter-library/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/submit-to-plugin-library/`,
    toPath: `/contributing/submit-to-plugin-library/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/rfc-process/`,
    toPath: `/contributing/rfc-process/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/packages/`, // Moved "Plugins" page from /packages to /plugins
    toPath: `/plugins/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/netlify-cms/`,
    toPath: `/docs/sourcing-from-netlify-cms/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/sourcing-from-saas-services/`,
    toPath: `/docs/sourcing-from-hosted-services/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/starter-showcase/`, // Moved "Starter Showcase" index page from /starter-showcase to /starters
    toPath: `/starters/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/gatsby-starters/`, // Main Gatsby starters page is the starter library
    toPath: `/starters/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/adding-third-party-services/`,
    toPath: `/docs/adding-website-functionality/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/bound-action-creators/`,
    toPath: `/docs/actions/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/bound-action-creators`,
    toPath: `/docs/actions`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/adding-images-fonts-files`,
    toPath: `/docs/importing-assets-into-files`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/blog/2019-10-03-gatsby-perf`,
    toPath: `/blog/2018-10-03-gatsby-perf`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/add-a-service-worker`,
    toPath: `/docs/add-offline-support-with-a-service-worker`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/add-offline-support`,
    toPath: `/docs/add-offline-support-with-a-service-worker`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/create-source-plugin/`,
    toPath: `/docs/creating-a-source-plugin/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/create-transformer-plugin/`,
    toPath: `/docs/creating-a-transformer-plugin/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/plugin-authoring/`,
    toPath: `/docs/how-plugins-work/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/source-plugin-tutorial/`,
    toPath: `/docs/pixabay-source-plugin-tutorial/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/how-plugins-work/`,
    toPath: `/docs/plugins/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/blog/2018-2-16-how-to-build-a-website-with-react/`,
    toPath: `/blog/2019-01-16-how-to-build-a-website-with-react/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/advanced-tutorials/`,
    toPath: `/tutorial/additional-tutorials/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/tutorial/advanced-tutorials/`,
    toPath: `/tutorial/additional-tutorials/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/authentication-tutorial/`,
    toPath: `/tutorial/authentication-tutorial/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/ecommerce-tutorial/`,
    toPath: `/tutorial/ecommerce-tutorial/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/image-tutorial/`,
    toPath: `/tutorial/wordpress-image-tutorial/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/tutorial/image-tutorial/`,
    toPath: `/tutorial/wordpress-image-tutorial/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/wordpress-source-plugin-tutorial/`,
    toPath: `/tutorial/wordpress-source-plugin-tutorial/`,
    isPermanent: true,
  })
  createRedirect({
    fromPath: `/docs/writing-documentation-with-docz/`,
    toPath: `/tutorial/writing-documentation-with-docz/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/behind-the-scenes/`,
    toPath: `/docs/gatsby-internals/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/behind-the-scenes-terminology/`,
    toPath: `/docs/gatsby-internals-terminology/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/themes/getting-started`,
    toPath: `/docs/themes/using-a-gatsby-theme`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/themes/introduction`,
    toPath: `/docs/themes/what-are-gatsby-themes`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/hosting-on-netlify/`,
    toPath: `/docs/deploying-to-netlify/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/querying-with-graphql/`,
    toPath: `/docs/graphql-concepts/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/docs/introducing-graphiql/`,
    toPath: `/docs/running-queries-with-graphiql/`,
    isPermanent: true,
  })

  Object.entries(startersRedirects).forEach(([fromSlug, toSlug]) => {
    createRedirect({
      fromPath: `/starters${fromSlug}`,
      toPath: `/starters${toSlug}`,
      isPermanent: true,
    })
  })

  return new Promise((resolve, reject) => {
    const docsTemplate = path.resolve(`src/templates/template-docs-markdown.js`)
    const blogPostTemplate = path.resolve(`src/templates/template-blog-post.js`)
    const blogListTemplate = path.resolve(`src/templates/template-blog-list.js`)
    const tagTemplate = path.resolve(`src/templates/tags.js`)
    const contributorPageTemplate = path.resolve(
      `src/templates/template-contributor-page.js`
    )
    const localPackageTemplate = path.resolve(
      `src/templates/template-docs-local-packages.js`
    )
    const remotePackageTemplate = path.resolve(
      `src/templates/template-docs-remote-packages.js`
    )
    const showcaseTemplate = path.resolve(
      `src/templates/template-showcase-details.js`
    )
    const creatorPageTemplate = path.resolve(
      `src/templates/template-creator-details.js`
    )
    const featureComparisonPageTemplate = path.resolve(
      `src/templates/template-feature-comparison.js`
    )

    // Query for markdown nodes to use in creating pages.
    graphql(`
      query {
        allMdx(
          sort: { order: DESC, fields: [frontmatter___date, fields___slug] }
          limit: 10000
          filter: { fileAbsolutePath: { ne: null } }
        ) {
          edges {
            node {
              fields {
                slug
                package
                released
              }
              frontmatter {
                title
                draft
                canonicalLink
                publishedAt
                issue
                tags
              }
            }
          }
        }
        allAuthorYaml {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
        allCreatorsYaml {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
        allSitesYaml(filter: { main_url: { ne: null } }) {
          edges {
            node {
              main_url
              fields {
                slug
                hasScreenshot
              }
            }
          }
        }
        allStartersYaml {
          edges {
            node {
              id
              fields {
                starterShowcase {
                  slug
                  stub
                }
                hasScreenshot
              }
              url
              repo
            }
          }
        }
        allNpmPackage {
          edges {
            node {
              id
              title
              slug
              readme {
                id
                childMarkdownRemark {
                  id
                  html
                }
              }
            }
          }
        }
        allEcosystemYaml {
          edges {
            node {
              starters
              plugins
            }
          }
        }
      }
    `).then(result => {
      if (result.errors) {
        return reject(result.errors)
      }

      const blogPosts = _.filter(result.data.allMdx.edges, edge => {
        const slug = _.get(edge, `node.fields.slug`)
        const draft = _.get(edge, `node.frontmatter.draft`)
        if (!slug) return undefined

        if (_.includes(slug, `/blog/`) && !draft) {
          return edge
        }

        return undefined
      })

      const releasedBlogPosts = blogPosts.filter(post =>
        _.get(post, `node.fields.released`)
      )

      // Create blog-list pages.
      const postsPerPage = 8
      const numPages = Math.ceil(releasedBlogPosts.length / postsPerPage)

      Array.from({
        length: numPages,
      }).forEach((_, i) => {
        createPage({
          path: i === 0 ? `/blog` : `/blog/page/${i + 1}`,
          component: slash(blogListTemplate),
          context: {
            limit: postsPerPage,
            skip: i * postsPerPage,
            numPages,
            currentPage: i + 1,
          },
        })
      })

      // Create blog-post pages.
      blogPosts.forEach((edge, index) => {
        let next = index === 0 ? null : blogPosts[index - 1].node
        if (next && !_.get(next, `fields.released`)) next = null

        const prev =
          index === blogPosts.length - 1 ? null : blogPosts[index + 1].node

        createPage({
          path: `${edge.node.fields.slug}`, // required
          component: slash(blogPostTemplate),
          context: {
            slug: edge.node.fields.slug,
            prev,
            next,
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
        .map(post => _.get(post, `node.frontmatter.tags`))
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

      // Create starter pages.
      const starters = _.filter(result.data.allStartersYaml.edges, edge => {
        const slug = _.get(edge, `node.fields.starterShowcase.slug`)
        if (!slug) {
          return null
        } else if (!_.get(edge, `node.fields.hasScreenshot`)) {
          reporter.warn(
            `Starter showcase entry "${edge.node.repo}" seems offline. Skipping.`
          )
          return null
        } else {
          return edge
        }
      })

      const starterTemplate = path.resolve(
        `src/templates/template-starter-page.js`
      )

      starters.forEach((edge, index) => {
        createPage({
          path: `/starters${edge.node.fields.starterShowcase.slug}`,
          component: slash(starterTemplate),
          context: {
            slug: edge.node.fields.starterShowcase.slug,
            stub: edge.node.fields.starterShowcase.stub,
          },
        })
      })

      // Create contributor pages.
      result.data.allAuthorYaml.edges.forEach(edge => {
        createPage({
          path: `${edge.node.fields.slug}`,
          component: slash(contributorPageTemplate),
          context: {
            slug: edge.node.fields.slug,
          },
        })
      })

      result.data.allCreatorsYaml.edges.forEach(edge => {
        if (!edge.node.fields) return
        if (!edge.node.fields.slug) return
        createPage({
          path: `${edge.node.fields.slug}`,
          component: slash(creatorPageTemplate),
          context: {
            slug: edge.node.fields.slug,
          },
        })
      })

      result.data.allSitesYaml.edges.forEach(edge => {
        if (!edge.node.fields) return
        if (!edge.node.fields.slug) return
        if (!edge.node.fields.hasScreenshot) {
          reporter.warn(
            `Site showcase entry "${edge.node.main_url}" seems offline. Skipping.`
          )
          return
        }
        createPage({
          path: `${edge.node.fields.slug}`,
          component: slash(showcaseTemplate),
          context: {
            slug: edge.node.fields.slug,
          },
        })
      })

      // Create docs pages.
      const docPages = result.data.allMdx.edges
      const docLinks = docLinksData[0].items
      const tutorialLinks = tutorialLinksData[0].items
      const contributingLinks = contributingLinksData[0].items

      // flatten sidebar links trees for easier next/prev link calculation
      function flattenList(itemList) {
        return itemList.reduce((reducer, { items, ...rest }) => {
          reducer.push(rest)
          if (items) reducer.push(...flattenList(items))
          return reducer
        }, [])
      }

      const flattenedDocs = flattenList(docLinks)
      const flattenedTutorials = flattenList(tutorialLinks)
      const flattenedContributing = flattenList(contributingLinks)

      // with flattened tree object finding next and prev is just getting the next index
      function getSibling(index, list, direction) {
        if (direction === `next`) {
          const next = index === list.length - 1 ? null : list[index + 1]
          // for tutorial links that use subheadings on the same page skip the link and try the next item
          if (next && next.link && next.link.includes(`#`)) {
            return getSibling(index + 1, list, `next`)
          }
          return next
        } else if (direction === `prev`) {
          const prev = index === 0 ? null : list[index - 1]
          if (prev && prev.link && prev.link.includes(`#`)) {
            return getSibling(index - 1, list, `prev`)
          }
          return prev
        } else {
          reporter.warn(
            `Did not provide direction to sibling function for building next and prev links`
          )
          return null
        }
      }

      function findDoc(doc) {
        if (!doc.link) return null
        return (
          doc.link === this.link ||
          doc.link === this.link.substring(0, this.link.length - 1)
        )
      }

      docPages.forEach(({ node }) => {
        const slug = _.get(node, `fields.slug`)
        if (!slug) return

        if (!_.includes(slug, `/blog/`)) {
          const docIndex = flattenedDocs.findIndex(findDoc, {
            link: slug,
          })
          const tutorialIndex = flattenedTutorials.findIndex(findDoc, {
            link: slug,
          })
          const contributingIndex = flattenedContributing.findIndex(findDoc, {
            link: slug,
          })

          // add values to page context for next and prev page
          let nextAndPrev = {}
          if (docIndex > -1) {
            nextAndPrev.prev = getSibling(docIndex, flattenedDocs, `prev`)
            nextAndPrev.next = getSibling(docIndex, flattenedDocs, `next`)
          }
          if (tutorialIndex > -1) {
            nextAndPrev.prev = getSibling(
              tutorialIndex,
              flattenedTutorials,
              `prev`
            )
            nextAndPrev.next = getSibling(
              tutorialIndex,
              flattenedTutorials,
              `next`
            )
          }
          if (contributingIndex > -1) {
            nextAndPrev.prev = getSibling(
              contributingIndex,
              flattenedContributing,
              `prev`
            )
            nextAndPrev.next = getSibling(
              contributingIndex,
              flattenedContributing,
              `next`
            )
          }

          createPage({
            path: `${node.fields.slug}`, // required
            component: slash(
              node.fields.package ? localPackageTemplate : docsTemplate
            ),
            context: {
              slug: node.fields.slug,
              ...nextAndPrev,
            },
          })
        }
      })

      const allPackages = result.data.allNpmPackage.edges
      // Create package readme
      allPackages.forEach(edge => {
        if (_.includes(localPackagesArr, edge.node.title)) {
          createPage({
            path: edge.node.slug,
            component: slash(localPackageTemplate),
            context: {
              slug: edge.node.slug,
              id: edge.node.id,
              layout: `plugins`,
            },
          })
        } else {
          createPage({
            path: edge.node.slug,
            component: slash(remotePackageTemplate),
            context: {
              slug: edge.node.slug,
              id: edge.node.id,
              layout: `plugins`,
            },
          })
        }
      })

      // Create feature comparison pages
      const jamstackPages = generateComparisonPageSet(`jamstack`)
      const cmsPages = generateComparisonPageSet(`cms`)
      const comparisonPages = [...jamstackPages, ...cmsPages]
      for (const { path, options, featureType } of comparisonPages) {
        createPage({
          path,
          component: slash(featureComparisonPageTemplate),
          context: {
            options,
            featureType,
          },
        })
      }

      // redirecting cypress-gatsby => gatsby-cypress
      createRedirect({
        fromPath: `/packages/cypress-gatsby/`,
        toPath: `/packages/gatsby-cypress/`,
        isPermanent: true,
      })

      // Read featured starters and plugins for Ecosystem
      ecosystemFeaturedItems = result.data.allEcosystemYaml.edges[0].node

      return resolve()
    })
  })
}

// Create slugs for files, set released status for blog posts.
exports.onCreateNode = ({ node, actions, getNode, reporter }) => {
  const { createNodeField } = actions
  let slug
  if (node.internal.type === `File`) {
    const parsedFilePath = path.parse(node.relativePath)
    if (node.sourceInstanceName === `docs`) {
      if (parsedFilePath.name !== `index` && parsedFilePath.dir !== ``) {
        slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
      } else if (parsedFilePath.dir === ``) {
        slug = `/${parsedFilePath.name}/`
      } else {
        slug = `/${parsedFilePath.dir}/`
      }
    }
    if (slug) {
      createNodeField({ node, name: `slug`, value: slug })
    }
  } else if (
    [`MarkdownRemark`, `Mdx`].includes(node.internal.type) &&
    getNode(node.parent).internal.type === `File`
  ) {
    const fileNode = getNode(node.parent)
    const parsedFilePath = path.parse(fileNode.relativePath)
    // Add slugs for docs pages
    if (fileNode.sourceInstanceName === `docs`) {
      if (parsedFilePath.name !== `index` && parsedFilePath.dir !== ``) {
        slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
      } else if (parsedFilePath.dir === ``) {
        slug = `/${parsedFilePath.name}/`
      } else {
        slug = `/${parsedFilePath.dir}/`
      }

      // Set released status and `published at` for blog posts.
      if (_.includes(parsedFilePath.dir, `blog`)) {
        let released = false
        const date = _.get(node, `frontmatter.date`)
        if (date) {
          released = moment.utc().isSameOrAfter(moment.utc(date))
        }
        createNodeField({ node, name: `released`, value: released })

        const canonicalLink = _.get(node, `frontmatter.canonicalLink`)
        const publishedAt = _.get(node, `frontmatter.publishedAt`)

        createNodeField({
          node,
          name: `publishedAt`,
          value: canonicalLink
            ? publishedAt || url.parse(canonicalLink).hostname
            : null,
        })
      }
    }
    // Add slugs for package READMEs.
    if (
      fileNode.sourceInstanceName === `packages` &&
      parsedFilePath.name === `README`
    ) {
      slug = `/packages/${parsedFilePath.dir}/`
      createNodeField({
        node,
        name: `title`,
        value: parsedFilePath.dir,
      })
      createNodeField({ node, name: `package`, value: true })
    }
    if (slug) {
      createNodeField({ node, name: `anchor`, value: slugToAnchor(slug) })
      createNodeField({ node, name: `slug`, value: slug })
    }
  } else if (node.internal.type === `AuthorYaml`) {
    slug = `/contributors/${slugify(node.id, {
      lower: true,
    })}/`
    createNodeField({ node, name: `slug`, value: slug })
  } else if (node.internal.type === `SitesYaml` && node.main_url) {
    const parsed = url.parse(node.main_url)
    const cleaned = parsed.hostname + parsed.pathname
    slug = `/showcase/${slugify(cleaned)}`
    createNodeField({ node, name: `slug`, value: slug })

    // determine if screenshot is available
    const screenshotNode = node.children
      .map(childID => getNode(childID))
      .find(node => node.internal.type === `Screenshot`)

    createNodeField({ node, name: `hasScreenshot`, value: !!screenshotNode })
  } else if (node.internal.type === `StartersYaml` && node.repo) {
    // To develop on the starter showcase, you'll need a GitHub
    // personal access token. Check the `www` README for details.
    // Default fields are to avoid graphql errors.
    const { owner, name: repoStub } = parseGHUrl(node.repo)
    const defaultFields = {
      slug: `/${owner}/${repoStub}/`,
      stub: repoStub,
      name: ``,
      description: ``,
      stars: 0,
      lastUpdated: ``,
      owner: ``,
      githubFullName: ``,
      gatsbyMajorVersion: [[`no data`, `0`]],
      allDependencies: [[`no data`, `0`]],
      gatsbyDependencies: [[`no data`, `0`]],
      miscDependencies: [[`no data`, `0`]],
    }

    // determine if screenshot is available
    const screenshotNode = node.children
      .map(childID => getNode(childID))
      .find(node => node.internal.type === `Screenshot`)

    createNodeField({ node, name: `hasScreenshot`, value: !!screenshotNode })

    if (!process.env.GITHUB_API_TOKEN) {
      return createNodeField({
        node,
        name: `starterShowcase`,
        value: {
          ...defaultFields,
        },
      })
    } else {
      return Promise.all([
        getpkgjson(node.repo),
        githubApiClient.request(`
            query {
              repository(owner:"${owner}", name:"${repoStub}") {
                name
                stargazers {
                  totalCount
                }
                createdAt
                pushedAt
                owner {
                  login
                }
                nameWithOwner
              }
            }
          `),
      ])
        .then(results => {
          const [pkgjson, githubData] = results
          const {
            stargazers: { totalCount: stars },
            pushedAt: lastUpdated,
            owner: { login: owner },
            name,
            nameWithOwner: githubFullName,
          } = githubData.repository

          const { dependencies = [], devDependencies = [] } = pkgjson
          const allDependencies = Object.entries(dependencies).concat(
            Object.entries(devDependencies)
          )

          const gatsbyMajorVersion = allDependencies
            .filter(([key, _]) => key === `gatsby`)
            .map(version => {
              let [gatsby, versionNum] = version
              if (versionNum === `latest` || versionNum === `next`) {
                return [gatsby, `2`]
              }
              return [gatsby, versionNum.replace(/\D/g, ``).charAt(0)]
            })

          // If a new field is added here, make sure a corresponding
          // change is made to "defaultFields" to not break DX
          const starterShowcaseFields = {
            slug: `/${owner}/${repoStub}/`,
            stub: repoStub,
            name,
            description: pkgjson.description,
            stars,
            lastUpdated,
            owner,
            githubFullName,
            gatsbyMajorVersion,
            allDependencies,
            gatsbyDependencies: allDependencies
              .filter(
                ([key, _]) => ![`gatsby-cli`, `gatsby-link`].includes(key) // remove stuff everyone has
              )
              .filter(([key, _]) => key.includes(`gatsby`)),
            miscDependencies: allDependencies.filter(
              ([key, _]) => !key.includes(`gatsby`)
            ),
          }
          createNodeField({
            node,
            name: `starterShowcase`,
            value: starterShowcaseFields,
          })
        })
        .catch(err => {
          reporter.panicOnBuild(
            `Error getting repo data for starter "${repoStub}":\n
            ${err.message}`
          )
        })
    }
  } else if (node.internal.type === `CreatorsYaml`) {
    // Creator pages
    const validTypes = {
      individual: `people`,
      agency: `agencies`,
      company: `companies`,
    }

    if (!validTypes[node.type]) {
      throw new Error(
        `Creators must have a type of “individual”, “agency”, or “company”, but invalid type “${node.type}” was provided for ${node.name}.`
      )
    }
    slug = `/creators/${validTypes[node.type]}/${slugify(node.name, {
      lower: true,
    })}`
    createNodeField({ node, name: `slug`, value: slug })
  }
  // end Creator pages
  return null
}

exports.onCreatePage = ({ page, actions }) => {
  // add lists of featured items to Ecosystem page
  if (page.path === `/ecosystem/` || page.path === `/`) {
    const { createPage, deletePage } = actions
    const oldPage = Object.assign({}, page)

    page.context.featuredStarters = ecosystemFeaturedItems.starters
    page.context.featuredPlugins = ecosystemFeaturedItems.plugins

    deletePage(oldPage)
    createPage(page)
  }

  if (page.path === `/plugins/`) {
    const { createPage, deletePage } = actions
    const oldPage = Object.assign({}, page)

    page.context.layout = `plugins`
    deletePage(oldPage)
    createPage(page)
  }
}

exports.onPostBuild = () => {
  fs.copySync(
    `../docs/blog/2017-02-21-1-0-progress-update-where-came-from-where-going/gatsbygram.mp4`,
    `./public/gatsbygram.mp4`
  )
}

// XXX this should probably be a plugin or something.
exports.sourceNodes = ({ actions: { createTypes }, schema }) => {
  /*
   * NOTE: This _only_ defines the schema we currently query for. If anything in
   * the query at `src/pages/contributing/events.js` changes, we need to make
   * sure these types are updated as well.
   *
   * But why?! Why would I do something this fragile?
   *
   * Gather round, children, and I’ll tell you the tale of @jlengstorf being too
   * lazy to make upstream fixes...
   */
  const typeDefs = `
    type Airtable implements Node {
      id: ID!
      data: AirtableData
    }

    type SitesYaml implements Node {
      title: String!
      main_url: String!
      url: String!
      source_url: String
      featured: Boolean
      categories: [String]!
      built_by: String
      built_by_url: String
      description: String
      screenshotFile: Screenshot # added by gatsby-transformer-screenshot
    }

    type StartersYaml implements Node {
      url: String!
      repo: String!
      description: String
      tags: [String!]
      features: [String!]
      screenshotFile: Screenshot # added by gatsby-transformer-screenshot
    }

    type AirtableData @dontInfer {
      name: String @proxy(from: "Name_of_Event")
      organizerFirstName: String @proxy(from: "Organizer_Name")
      organizerLastName: String @proxy(from: "Organizer's_Last_Name")
      date: Date @dateformat @proxy(from: "Date_of_Event")
      location: String @proxy(from: "Location_of_Event")
      url: String @proxy(from: "Event_URL_(if_applicable)")
      type: String @proxy(from: "What_type_of_event_is_this?")
      hasGatsbyTeamSpeaker: Boolean @proxy(from: "Gatsby_Speaker_Approved")
      approved: Boolean @proxy(from: "Approved_for_posting_on_event_page")
    }
  `

  createTypes(typeDefs)
}

exports.onCreateWebpackConfig = ({ actions, plugins }) => {
  const currentCommitSHA = require(`child_process`)
    .execSync(`git rev-parse HEAD`, {
      encoding: `utf-8`,
    })
    .trim()

  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        "process.env.COMMIT_SHA": JSON.stringify(currentCommitSHA),
      }),
    ],
  })
}

// Patch `DocumentationJs` type to handle custom `@availableIn` jsdoc tag
exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    DocumentationJs: {
      availableIn: {
        type: `[String]`,
        resolve(source) {
          const { tags } = source
          if (!tags || !tags.length) {
            return []
          }

          const availableIn = tags.find(tag => tag.title === `availableIn`)
          if (availableIn) {
            return availableIn.description
              .split(`\n`)[0]
              .replace(/[[\]]/g, ``)
              .split(`,`)
              .map(api => api.trim())
          }

          return []
        },
      },
    },
  })
}
