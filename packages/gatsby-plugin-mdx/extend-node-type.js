const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLJSON
} = require("gatsby/graphql");
const _ = require("lodash");
const remark = require("remark");
const visit = require("unist-util-visit");
const remove = require("unist-util-remove");
const stripMarkdown = require("strip-markdown");
const grayMatter = require("gray-matter");
const { createMdxAstCompiler } = require("@mdx-js/mdx");
const prune = require("underscore.string/prune");
const mdx = require("./utils/mdx");
const defaultOptions = require("./utils/default-options");

const stripFrontmatter = source => grayMatter(source).content;

module.exports = (
  { type, store, pathPrefix, getNode, getNodes, cache, reporter },
  pluginOptions
) => {
  if (type.name !== `Mdx`) {
    return {};
  }

  const options = defaultOptions(pluginOptions);
  const compiler = createMdxAstCompiler(options);

  return new Promise((resolve, reject) => {
    async function getAST(mdxNode) {
      return compiler.parse(stripFrontmatter(mdxNode.rawBody));
    }

    async function getText(mdxNode) {
      const ast = await getAST(mdxNode);

      // convert the mdxast to back to mdast
      remove(ast, "import");
      remove(ast, "export");
      visit(ast, "jsx", node => {
        node.type = "html";
      });

      const textAst = await remark()
        .use(stripMarkdown)
        .run(ast);

      return remark().stringify(textAst);
    }

    async function getCode(mdxNode) {
      const code = await mdx(mdxNode.rawBody);
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
      },
      excerpt: {
        type: GraphQLString,
        args: {
          pruneLength: {
            type: GraphQLInt,
            defaultValue: 140
          }
        },
        async resolve(mdxNode, { pruneLength }) {
          if (mdxNode.excerpt) {
            return Promise.resolve(mdxNode.excerpt);
          }
          const ast = await getAST(mdxNode);

          const excerptNodes = [];
          visit(ast, node => {
            if (node.type === "text" || node.type === "inlineCode") {
              excerptNodes.push(node.value);
            }
            return;
          });

          return prune(excerptNodes.join(" "), pruneLength, "…");
        }
      },
      timeToRead: {
        type: GraphQLInt,
        async resolve(mdxNode) {
          const text = await getText(mdxNode);
          console.log(text);
          let timeToRead = 0;
          const avgWPM = 265;
          const wordCount = _.words(text).length;
          timeToRead = Math.round(wordCount / avgWPM);
          if (timeToRead === 0) {
            timeToRead = 1;
          }
          return timeToRead;
        }
      }
    });
  });
};
