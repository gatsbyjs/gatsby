const select = require("unist-util-select");
const Promise = require("bluebird");
const fs = require("fs");
const jsYaml = require("js-yaml");
const _ = require("lodash");
const { loadNodeContents } = require("gatsby-source-filesystem");

async function modifyAST({ args }) {
  const { ast } = args;
  const files = select(
    ast,
    `
    File[extension="yaml"],
    File[extension="yml"]
  `
  );
  const contents = await Promise.map(files, file => loadNodeContents(file));
  files.forEach((file, index) => {
    const fileContents = contents[index];
    const yamlArray = jsYaml.load(fileContents).map(obj => ({
      ...obj,
      _sourceNodeId: file.id,
      type: _.capitalize(file.name),
      children: [],
    }));

    file.children = file.children.concat(yamlArray);
  });

  return ast;
}

exports.modifyAST = modifyAST;
