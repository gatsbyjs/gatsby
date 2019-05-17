const nodes = [
  {
    id: `file1`,
    parent: null,
    children: [`md1`],
    internal: {
      type: `File`,
      contentDigest: `file1`,
    },
    name: `1.md`,
  },
  {
    id: `file2`,
    parent: null,
    children: [`md2`],
    internal: {
      type: `File`,
      contentDigest: `file2`,
    },
    name: `2.md`,
  },
  {
    id: `file3`,
    parent: null,
    children: [`author2`, `author1`],
    internal: {
      type: `File`,
      contentDigest: `file3`,
    },
    name: `authors.yaml`,
  },
  {
    id: `md1`,
    parent: `file1`,
    children: [],
    internal: {
      type: `Markdown`,
      contentDigest: `md1`,
    },
    frontmatter: {
      title: `Markdown File 1`,
      date: new Date(Date.UTC(2019, 0, 1)),
      authors: [`author2@example.com`, `author1@example.com`],
      reviewer___NODE: `author2`,
      reviewerByEmail: `author2@example.com`,
    },
  },
  {
    id: `md2`,
    parent: `file2`,
    children: [],
    internal: {
      type: `Markdown`,
      contentDigest: `md2`,
    },
    frontmatter: {
      title: `Markdown File 2`,
      published: false,
      authors: [`author1@example.com`],
      reviewer___NODE: null,
      reviewerByEmail: null,
    },
  },
  {
    id: `author1`,
    parent: `file3`,
    children: [],
    internal: {
      type: `Author`,
      contentDigest: `author1`,
    },
    name: `Author 1`,
    email: `author1@example.com`,
  },
  {
    id: `author2`,
    parent: `file3`,
    children: [],
    internal: {
      type: `Author`,
      contentDigest: `author1`,
    },
    name: `Author 2`,
    email: `author2@example.com`,
  },
]

module.exports = nodes
