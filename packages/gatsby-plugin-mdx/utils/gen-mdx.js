const babel = require("@babel/core");
const grayMatter = require("gray-matter");
const mdx = require("@mdx-js/mdx");
const objRestSpread = require("@babel/plugin-proposal-object-rest-spread");

const debug = require("debug")("gatsby-mdx:gen-mdx");

const getSourcePluginsAsRemarkPlugins = require("./get-source-plugins-as-remark-plugins");
const htmlAttrToJSXAttr = require("./babel-plugin-html-attr-to-jsx-attr");
const BabelPluginPluckImports = require("./babel-plugin-pluck-imports");

/*
 * function mutateNode({
 *   pluginOptions,
 *   mdxNode,
 *   getNode,
 *   files,
 *   reporter,
 *   cache
 * }) {
 *   return Promise.each(pluginOptions.gatsbyRemarkPlugins, plugin => {
 *     const requiredPlugin = require(plugin.resolve);
 *     if (_.isFunction(requiredPlugin.mutateSource)) {
 *       return requiredPlugin.mutateSource(
 *         {
 *           mdxNode,
 *           files: fileNodes,
 *           getNode,
 *           reporter,
 *           cache
 *         },
 *         plugin.pluginOptions
 *       );
 *     } else {
 *       return Promise.resolve();
 *     }
 *   });
 * }
 *  */

module.exports = async function genMDX({
  node,
  options,
  getNode,
  getNodes,
  reporter,
  cache,
  pathPrefix
}) {
  const pathPrefixCacheStr = pathPrefix || ``;
  const payloadCacheKey = node =>
    `gatsby-mdx-entire-payload-${
      node.internal.contentDigest
    }-${pathPrefixCacheStr}`;

  const cachedPayload = await cache.get(payloadCacheKey(node));
  if (cachedPayload) {
    return cachedPayload;
  }

  let results = {
    mdast: undefined,
    hast: undefined,
    html: undefined,
    scopeImports: [],
    scopeIdentifiers: [],
    body: undefined
  };

  // TODO: a remark and a hast plugin that pull out the ast and store it in results
  /* const cacheMdast = () => ast => {
   *   results.mdast = ast;
   *   return ast;
   * };

   * const cacheHast = () => ast => {
   *   results.hast = ast;
   *   return ast;
   * }; */

  // pull classic style frontmatter off the raw MDX body
  debug("processing classic frontmatter");
  const { content } = grayMatter(node.rawBody);

  // get mdast by itself
  // in the future it'd be nice to not do this twice
  debug("generating AST");
  const compiler = mdx.createMdxAstCompiler(options);
  results.mdast = compiler.parse(content);

  /* await mutateNode({
   *   pluginOptions,
   *   mdxNode,
   *   files: getNodes().filter(n => n.internal.type === `File`),
   *   getNode,
   *   reporter,
   *   cache
   * }); */

  const gatsbyRemarkPluginsAsMDPlugins = await getSourcePluginsAsRemarkPlugins({
    gatsbyRemarkPlugins: options.gatsbyRemarkPlugins,
    mdxNode: node,
    //          files,
    getNode,
    getNodes,
    reporter,
    cache,
    pathPrefix
  });

  debug("running mdx");
  let code = await mdx(content, {
    ...options,
    mdPlugins: options.mdPlugins.concat(gatsbyRemarkPluginsAsMDPlugins)
  });

  code = `/* @jsx mdx */
${code}`;

  debug("compiling scope");
  const instance = new BabelPluginPluckImports();
  const result = babel.transform(code, {
    configFile: false,
    plugins: [instance.plugin, objRestSpread, htmlAttrToJSXAttr],
    presets: [
      require("@babel/preset-react"),
      [
        require("@babel/preset-env"),
        {
          useBuiltIns: "entry",
          modules: "false"
        }
      ]
    ]
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

  results.scopeImports = imports;
  results.scopeIdentifiers = identifiers;
  // TODO: be more sophisticated about these replacements
  results.body = result.code
    .replace(/export\s*{\s*MDXContent\s+as\s+default\s*};?/, "return MDXContent;")
    .replace(/\nexport /g, "\n");

  /* results.html = renderToStaticMarkup(
   *   React.createElement(MDXRenderer, null, results.body)
   * ); */
  cache.set(payloadCacheKey(node), results);
  return results;
};
