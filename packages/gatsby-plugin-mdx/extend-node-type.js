const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLJSON
} = require(`gatsby/graphql`);
const mdx = require("@mdx-js/mdx");

module.exports = (
  { type, store, pathPrefix, getNode, getNodes, cache, reporter },
  pluginOptions
) => {
  if (type.name !== `Mdx`) {
    return {};
  }

  pluginsCacheStr = pluginOptions.plugins.map(p => p.name).join(``);
  pathPrefixCacheStr = pathPrefix || ``;

  return new Promise((resolve, reject) => {
    async function getCode(markdownNode) {
      const code = await mdx(markdownNode.rawBody);
      return `import React from 'react'
import { MDXTag } from '@mdx-js/tag'

${code}`;
    }

    return resolve({
      code: {
        type: GraphQLString,
        resolve(markdownNode) {
          return getCode(markdownNode);
        }
      }
    });
  });
};
