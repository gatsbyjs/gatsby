"use strict";

const url = require(`url`);

const path = require(`path`);

const getTemplates = require(`../utils/get-templates`);

module.exports = async ({
  actions,
  graphql
}, pluginOptions) => {
  const {
    data
  } = await graphql(`
    query ALL_CONTENT_NODES {
      allContentNode {
        nodes {
          link
          id
        }
      }
    }
  `);
  const templates = getTemplates();
  await Promise.all(data.allContentNode.nodes.map(async node => {
    const pathname = url.parse(node.link).pathname;
    const template = path.resolve(templates[0]);
    await actions.createPage({
      component: template,
      path: pathname,
      context: {
        ID: node.id
      }
    });
  }));
};