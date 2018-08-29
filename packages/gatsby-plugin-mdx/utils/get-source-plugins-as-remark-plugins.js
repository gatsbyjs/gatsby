const visit = require("unist-util-visit");
const _ = require("lodash");
const HTMLtoJSX = require("htmltojsx");
const map = require("unist-util-map");
const debug = require("debug")("get-source-plugins-as-remark-plugins");

let fileNodes;

const htmlToJSXConverter = new HTMLtoJSX({
  createClass: false
});

// ensure only one `/` in new url
const withPathPrefix = (url, pathPrefix) =>
  (pathPrefix + url).replace(/\/\//, `/`);

const isJSXRegex = /<[A-Z]/g;
const htmlToJSXPlugin = () =>
  function transformer(ast) {
    const astMapped = map(ast, node => {
      if (node.type === "html" && !isJSXRegex.test(node.value)) {
        return { ...node, value: htmlToJSXConverter.convert(node.value) };
      } else {
        return node;
      }
    });
    return astMapped;
  };

module.exports = async function getSourcePluginsAsRemarkPlugins({
  gatsbyRemarkPlugins,
  mdxNode,
  getNode,
  getNodes,
  reporter,
  cache,
  pathPrefix
}) {
  debug("getSourcePluginsAsRemarkPlugins");
  let pathPlugin = undefined;
  if (pathPrefix) {
    pathPlugin = () =>
      async function transformer(markdownAST) {
        // Ensure relative links include `pathPrefix`
        visit(markdownAST, `link`, node => {
          if (
            node.url &&
            node.url.startsWith(`/`) &&
            !node.url.startsWith(`//`)
          ) {
            // TODO: where does withPathPrefix
            node.url = withPathPrefix(node.url, pathPrefix);
          }
        });
        return markdownAST;
      };
  }

  if (process.env.NODE_ENV !== `production` || !fileNodes) {
    fileNodes = getNodes().filter(n => n.internal.type === `File`);
  }

  // return list of mdPlugins
  const userPlugins = gatsbyRemarkPlugins
    .filter(plugin => {
      if (_.isFunction(require(plugin.resolve))) {
        return true;
      } else {
        debug("userPlugins: filtering out", plugin);
        return false;
      }
    })
    .map(plugin => {
      debug("userPlugins: contructing remark plugin for ", plugin);
      const requiredPlugin = require(plugin.resolve);
      return () =>
        async function transformer(markdownAST) {
          requiredPlugin(
            {
              markdownAST,
              markdownNode: mdxNode,
              getNode,
              files: fileNodes,
              pathPrefix,
              reporter,
              cache
            },
            plugin.pluginOptions || {}
          );
          return markdownAST;
        };
    });

  if (pathPlugin) {
    return [pathPlugin, ...userPlugins, htmlToJSXPlugin];
  } else {
    return [...userPlugins, htmlToJSXPlugin];
  }
};
