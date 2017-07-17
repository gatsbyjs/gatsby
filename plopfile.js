module.exports = function(plop) {
  // Add new package
  plop.setGenerator(`package`, {
    description: `This is sets up the basic files for a new package.`,
    prompts: [
      {
        type: `input`,
        name: `name`,
        message: `name of new package`,
      },
      {
        type: `input`,
        name: `author`,
        message: `Your name/email for putting in the package.json of the new package`,
      },
    ],
    actions: [
      {
        type: `add`,
        path: `packages/{{kebabCase name}}/package.json`,
        templateFile: `plop-templates/package/package.json.hbs`,
      },
      {
        type: `add`,
        path: `packages/{{kebabCase name}}/index.js`,
        templateFile: `plop-templates/package/index.js.hbs`,
      },
      {
        type: `add`,
        path: `packages/{{kebabCase name}}/README.md`,
        templateFile: `plop-templates/package/README.md.hbs`,
      },
      {
        type: `add`,
        path: `packages/{{kebabCase name}}/.gitignore`,
        templateFile: `plop-templates/package/.gitignore.hbs`,
      },
      {
        type: `add`,
        path: `packages/{{kebabCase name}}/.npmignore`,
        templateFile: `plop-templates/package/.npmignore.hbs`,
      },
      {
        type: `add`,
        path: `packages/{{kebabCase name}}/src/.gitkeep`,
      },
    ],
  })
  // Add new example site
  plop.setGenerator(`example`, {
    description: `This is sets up the basic files for a new example site.`,
    prompts: [
      {
        type: `input`,
        name: `name`,
        message: `name of new example site`,
      },
      {
        type: `input`,
        name: `author`,
        message: `Your name/email for putting in the package.json of the new example site`,
      },
    ],
    actions: [
      {
        type: `add`,
        path: `examples/{{kebabCase name}}/package.json`,
        templateFile: `plop-templates/example/package.json.hbs`,
      },
      {
        type: `add`,
        path: `examples/{{kebabCase name}}/src/pages/index.js`,
        templateFile: `plop-templates/example/index.js.hbs`,
      },
      {
        type: `add`,
        path: `examples/{{kebabCase name}}/README.md`,
        templateFile: `plop-templates/example/README.md.hbs`,
      },
      {
        type: `add`,
        path: `examples/{{kebabCase name}}/.gitignore`,
        templateFile: `plop-templates/example/.gitignore.hbs`,
      },
      {
        type: `add`,
        path: `examples/{{kebabCase name}}/.eslintrc`,
        templateFile: `plop-templates/example/.eslintrc.hbs`,
      },
    ],
  })
}
