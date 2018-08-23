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
const retext = require("retext");
const visit = require("unist-util-visit");
const remove = require("unist-util-remove");
const toString = require("mdast-util-to-string");
const generateTOC = require("mdast-util-toc");
const stripMarkdown = require("strip-markdown");
const grayMatter = require("gray-matter");
const { createMdxAstCompiler } = require("@mdx-js/mdx");
const prune = require("underscore.string/prune");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const BabelPluginPluckImports = require("babel-plugin-pluck-imports");
const objRestSpread = require("@babel/plugin-proposal-object-rest-spread");
const babel = require("@babel/core");
const rawMDX = require("@mdx-js/mdx");

const mdx = require("./utils/mdx");
const getTableOfContents = require("./utils/get-table-of-content");
const defaultOptions = require("./utils/default-options");

const stripFrontmatter = source => grayMatter(source).content;

module.exports = (
  { type /*store, pathPrefix, getNode, getNodes, cache, reporter*/ },
  pluginOptions
) => {
  if (!type.name.endsWith(`Mdx`)) {
    return {};
  }

  const options = defaultOptions(pluginOptions);
  const compiler = createMdxAstCompiler(options);

  return new Promise((resolve /*, reject*/) => {
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

    async function getCode(mdxNode, overrideOptions) {
      const code = await mdx(mdxNode.rawBody, {
        ...options,
        ...overrideOptions
      });

      return `import React from 'react'
import { MDXTag } from '@mdx-js/tag'

${code}`;
    }

    const HeadingType = new GraphQLObjectType({
      name: `MdxHeading${type.name}`,
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
      name: `Headings${type.name}`,
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
          name: `MDXCode${type.name}`,
          fields: {
            raw: {
              type: GraphQLString,
              resolve(markdownNode) {
                return getCode(markdownNode);
              }
            },
            body: {
              type: GraphQLString,
              async resolve(mdxNode) {
                const { content } = grayMatter(mdxNode.rawBody);
                let code = await rawMDX(content, {
                  ...options
                });

                const instance = new BabelPluginPluckImports();
                const result = babel.transform(code, {
                  plugins: [instance.plugin, objRestSpread],
                  presets: [require("@babel/preset-react")]
                });

                // TODO: be more sophisticated about these replacements
                return result.code
                  .replace("export default", "return")
                  .replace(/\nexport /g, "\n");
              }
            },
            scope: {
              type: GraphQLString,
              async resolve(mdxNode) {
                const CACHE_DIR = `.cache`;
                const PLUGIN_DIR = `gatsby-mdx`;
                const REMOTE_MDX_DIR = `remote-mdx-dir`;
                mkdirp.sync(
                  path.join(options.root, CACHE_DIR, PLUGIN_DIR, REMOTE_MDX_DIR)
                );
                const createFilePath = (directory, filename, ext) =>
                  path.join(
                    directory,
                    CACHE_DIR,
                    PLUGIN_DIR,
                    REMOTE_MDX_DIR,
                    `${filename}${ext}`
                  );

                const createHash = str =>
                  crypto
                    .createHash(`md5`)
                    .update(str)
                    .digest(`hex`);

                const { content } = grayMatter(mdxNode.rawBody);
                let code = await rawMDX(content, {
                  ...options
                });

                const instance = new BabelPluginPluckImports();
                babel.transform(code, {
                  plugins: [instance.plugin, objRestSpread],
                  presets: [require("@babel/preset-react")]
                });

                const identifiers = Array.from(instance.state.identifiers);
                const imports = Array.from(instance.state.imports);
                if (!identifiers.includes("React")) {
                  identifiers.push("React");
                  imports.push("import React from 'react'");
                }
                if (!identifiers.includes("MDXTag")) {
                  identifiers.push("MDXTag");
                  imports.push("import { MDXTag } from '@mdx-js/tag'");
                }
                const scopeFileContent = `${imports.join("\n")}

export default { ${identifiers.join(", ")} }`;

                const filePath = createFilePath(
                  options.root,
                  createHash(scopeFileContent),
                  ".js"
                );

                fs.writeFileSync(filePath, scopeFileContent);
                return filePath;
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
      headings: {
        type: new GraphQLList(HeadingType),
        args: {
          depth: {
            type: Headings
          }
        },
        async resolve(mdxNode, { depth }) {
          const ast = await getAST(mdxNode);
          let headings = [];
          visit(ast, "heading", heading => {
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
      tableOfContents: {
        type: GraphQLJSON,
        args: {
          maxDepth: {
            type: GraphQLInt,
            default: 6
          }
        },
        async resolve(mdxNode, { maxDepth }) {
          const ast = await getAST(mdxNode);
          const toc = generateTOC(ast, maxDepth);

          return getTableOfContents(toc.map, {});
        }
      },
      timeToRead: {
        type: GraphQLInt,
        async resolve(mdxNode) {
          const text = await getText(mdxNode);
          let timeToRead = 0;
          const avgWPM = 265;
          const wordCount = _.words(text).length;
          timeToRead = Math.round(wordCount / avgWPM);
          if (timeToRead === 0) {
            timeToRead = 1;
          }
          return timeToRead;
        }
      },
      wordCount: {
        type: new GraphQLObjectType({
          name: `wordCounts${type.name}`,
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
          let counts = {};

          const text = await getText(mdxNode);

          await retext()
            .use(count)
            .process(text);

          return {
            paragraphs: counts.ParagraphNode,
            sentences: counts.SentenceNode,
            words: counts.WordNode
          };

          function count() {
            return counter;
            function counter(tree) {
              visit(tree, visitor);
              function visitor(node) {
                counts[node.type] = (counts[node.type] || 0) + 1;
              }
            }
          }
        }
      }
    });
  });
};
