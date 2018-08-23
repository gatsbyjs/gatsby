const mkdirp = require("mkdirp");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const babel = require("@babel/core");
const syntaxObjRestSpread = require("@babel/plugin-syntax-object-rest-spread");
const debug = require("debug")("gatsby-mdx:component-with-mdx-scope");

const BabelPluginPluckExports = require("babel-plugin-pluck-exports");

module.exports = function componentWithMDXScope(
  absWrapperPath,
  codeScopeAbsPaths = [],
  projectRoot = process.cwd()
) {
  if (typeof codeScopeAbsPaths === "string") {
    codeScopeAbsPaths = [codeScopeAbsPaths];
  }
  mkdirp.sync(path.join(projectRoot, CACHE_DIR, PLUGIN_DIR, MDX_WRAPPERS_DIR));

  // hoist pageQuery and any other named exports
  const OGWrapper = fs.readFileSync(absWrapperPath, "utf-8");
  const instance = new BabelPluginPluckExports();
  babel.transform(OGWrapper, {
    plugins: [instance.plugin, syntaxObjRestSpread],
    presets: [require("@babel/preset-react")]
  }).code;

  const scopeHashes = codeScopeAbsPaths.map(codeScopeAbsPath => {
    // get the preexisting hash for the scope file to use in the new wrapper filename
    const scopePathSegments = codeScopeAbsPath.split("/");
    const scopeHash = scopePathSegments[scopePathSegments.length - 1].slice(
      0,
      -3
    );
    return scopeHash;
  });

  const mdxScopes = codeScopeAbsPaths
    .map((_, i) => `...__mdxScope_${i}`)
    .join(", ");
  const newWrapper = `// .cache/gatsby-mdx/wrapper-components/{wrapper-filepath-hash}-{scope-hash}.js
import React from 'react';
import { MDXScopeProvider } from 'gatsby-mdx/context';

${codeScopeAbsPaths
    .map((scopePath, i) => `import __mdxScope_${i} from '${scopePath}';`)
    .join("\n")}

import OriginalWrapper from '${absWrapperPath}';

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

const CACHE_DIR = `.cache`;
const PLUGIN_DIR = `gatsby-mdx`;
const MDX_WRAPPERS_DIR = `mdx-wrappers-dir`;

const createFilePath = (directory, filename, ext) =>
  path.join(
    directory,
    CACHE_DIR,
    PLUGIN_DIR,
    MDX_WRAPPERS_DIR,
    `${filename}${ext}`
  );

const createHash = str =>
  crypto
    .createHash(`md5`)
    .update(str)
    .digest(`hex`);
