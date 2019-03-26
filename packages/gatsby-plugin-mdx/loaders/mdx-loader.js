const _ = require("lodash");
const { getOptions } = require("loader-utils");
const grayMatter = require("gray-matter");
const unified = require("unified");

const {
  isImport,
  isExport,
  isExportDefault,
  BLOCKS_REGEX,
  EMPTY_NEWLINE
} = require("@mdx-js/mdx/util");

const toMDAST = require("remark-parse");
const squeeze = require("remark-squeeze-paragraphs");
const debug = require("debug")("gatsby-mdx:mdx-loader");

const genMdx = require("../utils/gen-mdx");
const withDefaultOptions = require("../utils/default-options");
const createMDXNode = require("../utils/create-mdx-node");
const { createFileNode } = require("../utils/create-fake-file-node");
const slash = require("slash");

const DEFAULT_OPTIONS = {
  footnotes: true,
  remarkPlugins: [],
  rehypePlugins: [],
  compilers: [],
  blocks: [BLOCKS_REGEX]
};

/**
 * TODO: Find a way to PR all of this code that was lifted
 * from @mdx-js/mdx back into mdx with the modifications. We
 * don't want to maintain subtly different parsing code if we
 * can avoid it.
 */
const hasDefaultExport = (str, options) => {
  let hasDefaultExportBool = false;

  function getDefaultExportBlock(subvalue) {
    const isDefault = isExportDefault(subvalue);
    hasDefaultExportBool = hasDefaultExportBool || isDefault;
    return isDefault;
  }
  const tokenizeEsSyntax = (eat, value) => {
    const index = value.indexOf(EMPTY_NEWLINE);
    const subvalue = value.slice(0, index);

    if (isExport(subvalue) || isImport(subvalue)) {
      return eat(subvalue)({
        type: isExport(subvalue) ? "export" : "import",
        default: getDefaultExportBlock(subvalue),
        value: subvalue
      });
    }
  };

  tokenizeEsSyntax.locator = value => {
    return isExport(value) || isImport(value) ? -1 : 1;
  };

  function esSyntax() {
    var Parser = this.Parser;
    var tokenizers = Parser.prototype.blockTokenizers;
    var methods = Parser.prototype.blockMethods;

    tokenizers.esSyntax = tokenizeEsSyntax;

    methods.splice(methods.indexOf("paragraph"), 0, "esSyntax");
  }

  const { content } = grayMatter(str);
  unified()
    .use(toMDAST, options)
    .use(esSyntax)
    .use(squeeze, options)
    .parse(content)
    .toString();

  return hasDefaultExportBool;
};

module.exports = async function(content) {
  const callback = this.async();
  const {
    getNode: rawGetNode,
    getNodes,
    reporter,
    cache,
    pathPrefix,
    pluginOptions
  } = getOptions(this);

  const options = withDefaultOptions(pluginOptions);

  let fileNode = getNodes().find(
    node =>
      node.internal.type === `File` && node.absolutePath === this.resourcePath
  );
  let isFakeFileNode = false;
  if (!fileNode) {
    fileNode = await createFileNode(
      this.resourcePath,
      pth => `fakeFileNodeMDX${pth}`
    );
    isFakeFileNode = true;
  }

  const source = fileNode && fileNode.sourceInstanceName;

  const mdxNode = await createMDXNode({
    id: "fakeNodeIdMDXFileABugIfYouSeeThis",
    node: fileNode,
    content
  });

  // get the default layout for the file source group, or if it doesn't
  // exist, the overall default layout
  const defaultLayout = _.get(
    options.defaultLayouts,
    source,
    _.get(options.defaultLayouts, "default")
  );

  let code = content;
  // after running mdx, the code *always* has a default export, so this
  // check needs to happen first.
  if (!hasDefaultExport(content, DEFAULT_OPTIONS) && !!defaultLayout) {
    debug("inserting default layout", defaultLayout);
    const { content: contentWithoutFrontmatter, matter } = grayMatter(content);

    code = `${matter}

import DefaultLayout from "${slash(defaultLayout)}"

export default DefaultLayout

${contentWithoutFrontmatter}`;
  }

  const getNode = id => {
    if (isFakeFileNode && id === fileNode.id) {
      return fileNode;
    } else {
      return rawGetNode(id);
    }
  };

  const { rawMDXOutput } = await genMdx({
    isLoader: true,
    options,
    node: { ...mdxNode, rawBody: code },
    getNode,
    getNodes,
    reporter,
    cache,
    pathPrefix
  });

  try {
    return callback(null, rawMDXOutput);
  } catch (e) {
    callback(e);
  }
};
