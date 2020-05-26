const babel = require(`@babel/core`)
const grayMatter = require(`gray-matter`)
const mdx = require(`@mdx-js/mdx`)
const objRestSpread = require(`@babel/plugin-proposal-object-rest-spread`)

const debug = require(`debug`)(`gatsby-plugin-mdx:gen-mdx`)

const getSourcePluginsAsRemarkPlugins = require(`./get-source-plugins-as-remark-plugins`)
const htmlAttrToJSXAttr = require(`./babel-plugin-html-attr-to-jsx-attr`)
const removeExportKeywords = require(`./babel-plugin-remove-export-keywords`)
const BabelPluginPluckImports = require(`./babel-plugin-pluck-imports`)

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

module.exports = async function genMDX(
  {
    isLoader,
    node,
    options,
    getNode,
    getNodes,
    reporter,
    cache,
    pathPrefix,
    ...helpers
  },
  { forceDisableCache = false } = {}
) {
  const pathPrefixCacheStr = pathPrefix || ``
  const payloadCacheKey = node =>
    `gatsby-plugin-mdx-entire-payload-${node.internal.contentDigest}-${pathPrefixCacheStr}`

  if (!forceDisableCache) {
    const cachedPayload = await cache.get(payloadCacheKey(node))
    if (cachedPayload) {
      return cachedPayload
    }
  }

  let results = {
    mdast: undefined,
    hast: undefined,
    html: undefined,
    scopeImports: [],
    scopeIdentifiers: [],
    body: undefined,
  }

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
  debug(`processing classic frontmatter`)
  const { data, content: frontMatterCodeResult } = grayMatter(node.rawBody)
  const content = `${frontMatterCodeResult}

export const _frontmatter = ${JSON.stringify(data)}`

  // get mdast by itself
  // in the future it'd be nice to not do this twice
  debug(`generating AST`)
  const compiler = mdx.createMdxAstCompiler(options)
  results.mdast = compiler.parse(content)

  /* await mutateNode({
   *   pluginOptions,
   *   mdxNode,
   *   files: getNodes().filter(n => n.internal.type === `File`),
   *   getNode,
   *   reporter,
   *   cache
   * }); */

  const gatsbyRemarkPluginsAsremarkPlugins = await getSourcePluginsAsRemarkPlugins(
    {
      gatsbyRemarkPlugins: options.gatsbyRemarkPlugins,
      mdxNode: node,
      //          files,
      getNode,
      getNodes,
      reporter,
      cache,
      pathPrefix,
      compiler: {
        parseString: compiler.parse.bind(compiler),
        generateHTML: ast => mdx(ast, options),
      },
      ...helpers,
    }
  )

  debug(`running mdx`)
  let code = await mdx(content, {
    filepath: node.fileAbsolutePath,
    ...options,
    remarkPlugins: options.remarkPlugins.concat(
      gatsbyRemarkPluginsAsremarkPlugins
    ),
  })

  results.rawMDXOutput = `/* @jsx mdx */
import { mdx } from '@mdx-js/react';
${code}`

  if (!isLoader) {
    debug(`compiling scope`)
    const instance = new BabelPluginPluckImports()
    const result = babel.transform(code, {
      configFile: false,
      plugins: [
        instance.plugin,
        objRestSpread,
        htmlAttrToJSXAttr,
        removeExportKeywords,
      ],
      presets: [
        require(`@babel/preset-react`),
        [
          require(`@babel/preset-env`),
          {
            useBuiltIns: `entry`,
            corejs: 2,
            modules: false,
          },
        ],
      ],
    })

    const identifiers = Array.from(instance.state.identifiers)
    const imports = Array.from(instance.state.imports)
    if (!identifiers.includes(`React`)) {
      identifiers.push(`React`)
      imports.push(`import * as React from 'react'`)
    }

    results.scopeImports = imports
    results.scopeIdentifiers = identifiers
    // TODO: be more sophisticated about these replacements
    results.body = result.code
      .replace(
        /export\s*default\s*function\s*MDXContent\s*/,
        `return function MDXContent`
      )
      .replace(
        /export\s*{\s*MDXContent\s+as\s+default\s*};?/,
        `return MDXContent;`
      )
  }
  /* results.html = renderToStaticMarkup(
   *   React.createElement(MDXRenderer, null, results.body)
   * ); */
  if (!forceDisableCache) {
    await cache.set(payloadCacheKey(node), results)
  }
  return results
}
