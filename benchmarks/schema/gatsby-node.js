const fs = require('fs');
const path = require('path');
const mime = require('mime/lite');
const YAML = require('yamljs');

const DATA_DIR = './data';
const IMAGE_DIR = './static/images';

const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

const addTypeDefs = ({ addTypeDefs }) => {
  const typeDefs = `
    type File implements Node {
      name: String!
      dir: String
      absolutePath: String
    }

    type AuthorsYaml implements Node {
      name: String
      firstname: String
      email: String
      image: File @link(by: "relativePath")
    }

    type Frontmatter {
      title: String
      date: Date @dateformat(defaultFormat: "YYYY")
      published: Boolean
      authors: [AuthorsYaml] @link(by: "email")
    }

    type Markdown implements Node {
      md: String
      frontmatter: Frontmatter
    }
  `;
  addTypeDefs(typeDefs);
};

const sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions;
  const dirs = [path.resolve(DATA_DIR), path.resolve(IMAGE_DIR)];
  dirs.forEach(dir => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      if (!file.isFile()) return;
      const { name } = file;
      const absolutePath = path.join(dir, name);
      const relativeDir = dir.startsWith('static')
        ? path.relative(__dirname, dir)
        : path.relative(path.join(__dirname, 'static'), dir);
      const relativePath = path.join(relativeDir, name);
      const mediaType = mime.getType(absolutePath);
      const content = mediaType.startsWith('text')
        ? fs.readFileSync(absolutePath, 'utf-8')
        : '';
      createNode({
        id: createNodeId(`File ${name}`),
        parent: null,
        children: [],
        internal: {
          type: 'File',
          mediaType,
          content,
          contentDigest: createContentDigest(content),
        },
        name,
        dir,
        relativeDir,
        absolutePath,
        relativePath,
      });
    });
  });
};

const onCreateNode = ({ actions, node, createNodeId, createContentDigest }) => {
  const { createNode, createParentChildLink } = actions;
  const { id, name, internal } = node;
  const { content } = internal;

  switch (node.internal.mediaType) {
    case 'text/markdown':
      const [frontmatter, md] = content.split('---').filter(Boolean);
      const child = {
        id: createNodeId(`Markdown ${id}`),
        parent: id,
        children: [],
        internal: {
          type: 'Markdown',
          content,
          contentDigest: createContentDigest(content),
        },
        frontmatter: YAML.parse(frontmatter),
        md,
      };
      createNode(child);
      createParentChildLink({ parent: node, child });
      break;

    case 'text/yaml':
      const type = capitalize(name.slice(0, name.lastIndexOf('.'))) + 'Yaml';
      const createYamlNode = (fields, i) => {
        if (!isObject(fields)) return;
        const child = {
          id: createNodeId(`${type} [${i}] ${id}`),
          parent: id,
          children: [],
          internal: {
            type,
            content,
            contentDigest: createContentDigest(content),
          },
          ...fields,
        };
        createNode(child);
        createParentChildLink({ parent: node, child });
      };
      const parsed = YAML.parse(content);
      Array.isArray(parsed)
        ? parsed.forEach(createYamlNode)
        : createYamlNode(parsed);
      break;

    default:
  }
};

const createPages = ({ actions, graphql }) => {
  const { createPage } = actions;
  return graphql(`
    query {
      allMarkdown(
        sort: { fields: [FRONTMATTER___DATE], order: DESC }
        filter: { frontmatter: { title: { ne: null } } }
      ) {
        id
      }
    }
  `).then(({ errors, data }) => {
    if (errors) throw errors;
    createPage({
      path: `/`,
      component: path.resolve('./templates/index.js')
    })
    data.allMarkdown.forEach(({ id }) => {
      createPage({
        path: id,
        component: path.resolve('./templates/template.js'),
        context: { id },
      });
    });
  });
};

module.exports = {
  addTypeDefs,
  createPages,
  onCreateNode,
  sourceNodes,
};
