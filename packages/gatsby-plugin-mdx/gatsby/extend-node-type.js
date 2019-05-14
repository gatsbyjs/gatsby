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
const english = require("retext-english");
const remark2retext = require("remark-retext");
const unified = require("unified");
const visit = require("unist-util-visit");
const remove = require("unist-util-remove");
const toString = require("mdast-util-to-string");
const generateTOC = require("mdast-util-toc");
const prune = require("underscore.string/prune");

const debug = require("debug")("gatsby-mdx:extend-node-type");
const getTableOfContents = require("../utils/get-table-of-content");
const defaultOptions = require("../utils/default-options");
const genMDX = require("../utils/gen-mdx");
const { mdxHTMLLoader: loader } = require("../utils/render-html");

module.exports = (
  { type, pathPrefix, getNode, getNodes, cache, reporter },
  pluginOptions
) => {
  const mdxHTMLLoader = loader({ reporter, cache });
  if (type.name !== `Mdx`) {
    return {};
  }

  const options = defaultOptions(pluginOptions);

  for (let plugin of options.gatsbyRemarkPlugins) {
    debug("requiring", plugin.resolve);
    const requiredPlugin = require(plugin.resolve);
    debug("required", plugin);
    if (_.isFunction(requiredPlugin.setParserPlugins)) {
      for (let parserPlugin of requiredPlugin.setParserPlugins(
        plugin.pluginOptions
      )) {
        if (_.isArray(parserPlugin)) {
          const [parser, parserPluginOptions] = parserPlugin;
          debug(
            "adding remarkPlugin with options",
            plugin,
            parserPluginOptions
          );
          options.remarkPlugins.push([parser, parserPluginOptions]);
        } else {
          debug("adding remarkPlugin", plugin);
          options.remarkPlugins.push(parserPlugin);
        }
      }
    }
  }

  const processMDX = ({ node }) =>
    genMDX({ node, getNode, getNodes, reporter, cache, pathPrefix, options });
  return new Promise((resolve /*, reject*/) => {
    async function getCounts(mdxNode) {
      let counts = {};
      const { mdast } = await processMDX({ node: mdxNode });

      // convert the mdxast to back to mdast
      remove(mdast, "import");
      remove(mdast, "export");
      visit(mdast, "jsx", node => {
        node.type = "html";
      });

      await remark()
        .use(
          remark2retext,
          unified()
            .use(english)
            .use(count)
        )
        .run(mdast);

      function count() {
        return counter;
        function counter(tree) {
          visit(tree, visitor);
          function visitor(node) {
            counts[node.type] = (counts[node.type] || 0) + 1;
          }
        }
      }

      return {
        paragraphs: counts.ParagraphNode,
        sentences: counts.SentenceNode,
        words: counts.WordNode
      };
    }

    const HeadingType = new GraphQLObjectType({
      name: `MdxHeadingMdx`,
      fields: {
        value: {
          type: GraphQLString,
          resolve(heading) {
            return heading.value;
          }
        },
        depth: {
          type: GraphQLInt,
          resolve(heading) {
            return heading.depth;
          }
        }
      }
    });
    const Headings = new GraphQLEnumType({
      name: `HeadingsMdx`,
      values: {
        h1: { value: 1 },
        h2: { value: 2 },
        h3: { value: 3 },
        h4: { value: 4 },
        h5: { value: 5 },
        h6: { value: 6 }
      }
    });

    return resolve({
      code: {
        resolve(mdxNode) {
          return mdxNode;
        },
        type: new GraphQLObjectType({
          name: `MDXCodeMdx`,
          fields: {
            body: {
              type: GraphQLString,
              async resolve(mdxNode) {
                const { body } = await processMDX({ node: mdxNode });
                return body;
              }
            },
            scope: {
              type: GraphQLString,
              async resolve() {
                return "";
              }
            }
          }
        })
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
          const { mdast } = await processMDX({ node: mdxNode });

          const excerptNodes = [];
          visit(mdast, node => {
            if (node.type === "text" || node.type === "inlineCode") {
              excerptNodes.push(node.value);
            }
            return;
          });

          return prune(excerptNodes.join(" "), pruneLength, "…");
        }
      },
      headings: {
        type: new GraphQLList(HeadingType),
        args: {
          depth: {
            type: Headings
          }
        },
        async resolve(mdxNode, { depth }) {
          // TODO: change this to operate on html instead of mdast
          const { mdast } = await processMDX({ node: mdxNode });
          let headings = [];
          visit(mdast, "heading", heading => {
            headings.push({
              value: toString(heading),
              depth: heading.depth
            });
          });
          if (typeof depth === `number`) {
            headings = headings.filter(heading => heading.depth === depth);
          }
          return headings;
        }
      },
      html: {
        type: GraphQLString,
        async resolve(mdxNode) {
          if (mdxNode.html) {
            return Promise.resolve(mdxNode.html);
          }
          const { body } = await processMDX({ node: mdxNode });
          try {
            const html = await mdxHTMLLoader.load({ ...mdxNode, body });
            return html;
          } catch (e) {
            reporter.error(
              `Error querying the \`html\` field. This field is intended for use with RSS feed generation.
If you're trying to use it in application-level code, try querying for code.body instead.
Original error:
${e}`
            );
          }
        }
      },
      mdxAST: {
        type: GraphQLJSON,
        async resolve(mdxNode) {
          const { mdast } = await processMDX({ node: mdxNode });
          return mdast;
        }
      },
      tableOfContents: {
        type: GraphQLJSON,
        args: {
          maxDepth: {
            type: GraphQLInt,
            default: 6
          }
        },
        async resolve(mdxNode, { maxDepth }) {
          const { mdast } = await processMDX({ node: mdxNode });
          const toc = generateTOC(mdast, maxDepth);

          return getTableOfContents(toc.map, {});
        }
      },
      timeToRead: {
        type: GraphQLInt,
        async resolve(mdxNode) {
          const { words } = await getCounts(mdxNode);
          let timeToRead = 0;
          const avgWPM = 265;
          timeToRead = Math.round(words / avgWPM);
          if (timeToRead === 0) {
            timeToRead = 1;
          }
          return timeToRead;
        }
      },
      wordCount: {
        type: new GraphQLObjectType({
          name: `wordCountsMdx`,
          fields: {
            paragraphs: {
              type: GraphQLInt
            },
            sentences: {
              type: GraphQLInt
            },
            words: {
              type: GraphQLInt
            }
          }
        }),
        async resolve(mdxNode) {
          return getCounts(mdxNode);
        }
      }
    });
  });
};
