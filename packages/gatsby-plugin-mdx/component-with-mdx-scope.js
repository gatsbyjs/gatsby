const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const babel = require("@babel/core");
const syntaxObjRestSpread = require("@babel/plugin-syntax-object-rest-spread");
const typescriptPlugin = require("@babel/plugin-transform-typescript");
const debug = require("debug")("gatsby-mdx:component-with-mdx-scope");
const slash = require("slash");

const BabelPluginPluckExports = require("babel-plugin-pluck-exports");

const { MDX_WRAPPERS_LOCATION } = require("./constants");

module.exports = function componentWithMDXScope(
  absWrapperPath,
  codeScopeAbsPaths = [],
  projectRoot = process.cwd()
) {
  if (typeof codeScopeAbsPaths === "string") {
    codeScopeAbsPaths = [codeScopeAbsPaths];
  }
  const isTS = absWrapperPath.endsWith('.ts');
  const isTSX = absWrapperPath.endsWith('.tsx');

  // hoist pageQuery and any other named exports
  const OGWrapper = fs.readFileSync(absWrapperPath, "utf-8");
  const instance = new BabelPluginPluckExports();
  const plugins = [instance.plugin, syntaxObjRestSpread];
  if (isTS || isTSX) {
    plugins.push([typescriptPlugin, { isTSX }]);
  }
  babel.transform(OGWrapper, {
    plugins,
    presets: [require("@babel/preset-react")]
  }).code;

  const scopeHashes = codeScopeAbsPaths.map(codeScopeAbsPath => {
    // get the preexisting hash for the scope file to use in the new wrapper filename
    const base = path.parse(codeScopeAbsPath).base;
    const scopeHash = base.slice(0, -3);
    return scopeHash;
  });

  const mdxScopes = codeScopeAbsPaths
    .map((_, i) => `...__mdxScope_${i}`)
    .join(", ");
  const newWrapper = `// .cache/gatsby-mdx/wrapper-components/{wrapper-filepath-hash}-{scope-hash}.js
import React from 'react';
import { MDXScopeProvider } from 'gatsby-mdx/context';

${codeScopeAbsPaths
    .map((scopePath, i) => `import __mdxScope_${i} from '${slash(scopePath)}';`)
    .join("\n")}

import OriginalWrapper from '${slash(absWrapperPath)}';

import { graphql } from 'gatsby';

// pageQuery, etc get hoisted to here
${instance.state.exports.map(exportString => exportString)};

export default ({children, ...props}) => <MDXScopeProvider __mdxScope={{${mdxScopes}}}>
  <OriginalWrapper
    {...props}
  >
    {children}
  </OriginalWrapper>
</MDXScopeProvider>`;

  const hashName =
    scopeHashes.length > 1
      ? `scope-hashes-${createHash(scopeHashes.sort().join("-"))}`
      : `scope-hash-${scopeHashes.sort().join("-")}`;
  const absPathToNewWrapper = createFilePath(
    projectRoot,
    `${createHash(absWrapperPath)}--${hashName}`,
    ".js"
  );

  fs.writeFileSync(absPathToNewWrapper, newWrapper);

  debug(`wrapper "${absPathToNewWrapper}" created from "${absWrapperPath}"`);
  return absPathToNewWrapper;
};

const createFilePath = (directory, filename, ext) =>
  path.join(directory, MDX_WRAPPERS_LOCATION, `${filename}${ext}`);

const createHash = str =>
  crypto
    .createHash(`md5`)
    .update(str)
    .digest(`hex`);
