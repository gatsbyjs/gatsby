const nodes = [
  {
    id: `person1`,
    parent: null,
    children: [],
    internal: { type: `Author`, contentDigest: `0` },
    name: `Person1`,
    email: `person1@example.com`,
  },
  {
    id: `person2`,
    parent: null,
    children: [],
    internal: { type: `Contributor`, contentDigest: `0` },
    name: `Person2`,
    email: `person2@example.com`,
  },
  {
    id: `person3`,
    parent: null,
    children: [],
    internal: { type: `Author`, contentDigest: `0` },
    name: `Person3`,
    email: null,
  },
  {
    id: `post1`,
    parent: `file1`,
    children: [],
    internal: { type: `Post`, contentDigest: `0` },
    nestedObject: [
      {
        nestedValue: `1`,
      },
      {
        nestedValue: `3`,
      },
    ],
    frontmatter: {
      authors: [`person1`],
      reviewers: [`person1`, `person2`],
      published: false,
      date: new Date(Date.UTC(2019, 0, 1)),
    },
  },
  {
    id: `post2`,
    parent: `file2`,
    children: [],
    internal: { type: `Post`, contentDigest: `0` },
    nestedObject: [
      {
        nestedValue: `2`,
      },
    ],
    frontmatter: {
      authors: [`person1`, `person2`],
      reviewers: [],
      published: true,
      date: new Date(Date.UTC(2018, 0, 1)),
    },
  },
  {
    id: `post3`,
    parent: `file3`,
    children: [],
    internal: { type: `Post`, contentDigest: `0` },
    frontmatter: {
      authors: [],
      reviewers: [`person3`],
      published: false,
      date: new Date(Date.UTC(2017, 0, 1)),
    },
  },
  {
    id: `file1`,
    parent: null,
    children: [`post1`],
    internal: { type: `File`, contentDigest: `0` },
    name: `File1`,
  },
  {
    id: `file2`,
    parent: null,
    children: [`post2`],
    internal: { type: `RemoteFile`, contentDigest: `0` },
    url: `RemoteFile2`,
  },
  {
    id: `file3`,
    parent: null,
    children: [`post3`],
    internal: { type: `File`, contentDigest: `0` },
    name: `File3`,
  },
]

module.exports = nodes
