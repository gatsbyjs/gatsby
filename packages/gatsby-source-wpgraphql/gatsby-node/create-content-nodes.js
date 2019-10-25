"use strict";

const fetch = require(`isomorphic-fetch`);

const _ = require(`lodash`);

const fetchGraphql = async ({
  url,
  query,
  variables
}) => (await fetch(url, {
  method: `POST`,
  headers: {
    "Content-Type": `application/json`
  },
  body: JSON.stringify({
    query,
    variables
  })
})).json();

const getPagesQuery = contentTypePlural => `
  # Define our query variables
  query GET_GATSBY_PAGES($first:Int $after:String) {
    ${contentTypePlural}(
        first: $first
        after: $after
      ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            content
            title
            link
            date
            id
          }
      }
  }
`;

const allContentNodes = [];

const fetchContentTypeNodes = async ({
  contentTypePlural,
  contentTypeSingular,
  url,
  ...variables
}) => {
  const query = getPagesQuery(contentTypePlural);
  const {
    data
  } = await fetchGraphql({
    url,
    query,
    variables
  });
  const {
    [contentTypePlural]: {
      nodes,
      pageInfo: {
        hasNextPage,
        endCursor
      }
    }
  } = data;

  if (nodes) {
    nodes.forEach(node => {
      node.contentType = contentTypeSingular;
      node.wpId = node.id;
      allContentNodes.push(node);
    });
  }

  if (hasNextPage) {
    return fetchContentTypeNodes({
      first: 10,
      after: endCursor,
      url,
      contentTypePlural
    });
  }

  return allContentNodes;
};

const getAvailableContentTypes = () => {
  const contentTypes = [{
    plural: `pages`,
    singular: `page`
  }, {
    plural: `posts`,
    singular: `post`
  }];
  return contentTypes;
};

const fetchWPGQLContentNodes = async ({
  url
}) => {
  const contentTypes = getAvailableContentTypes();

  const contentNodes = _.flatten((await Promise.all(contentTypes.map(async ({
    plural,
    singular
  }) => {
    const allNodesOfContentType = await fetchContentTypeNodes({
      first: 10,
      after: null,
      contentTypePlural: plural,
      contentTypeSingular: singular,
      url
    });
    return allNodesOfContentType;
  }))));

  return contentNodes;
};

module.exports = async ({
  actions,
  createNodeId,
  createContentDigest
}, pluginOptions) => {
  const wpgqlNodes = await fetchWPGQLContentNodes(pluginOptions);
  await Promise.all(wpgqlNodes.map(async node => actions.createNode({ ...node,
    id: createNodeId(`ContentNode-${node.id}`),
    parent: null,
    internal: {
      contentDigest: createContentDigest(node),
      type: `ContentNode`
    }
  })));
};