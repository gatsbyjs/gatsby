module.exports = function(plop) {
  // create your generators here
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
        templateFile: `plop-templates/package.json.hbs`,
      },
      {
        type: `add`,
        path: `packages/{{kebabCase name}}/index.js`,
        templateFile: `plop-templates/index.js.hbs`,
      },
      {
        type: `add`,
        path: `packages/{{kebabCase name}}/README.md`,
        templateFile: `plop-templates/README.md.hbs`,
      },
      {
        type: `add`,
        path: `packages/{{kebabCase name}}/.gitignore`,
        templateFile: `plop-templates/.gitignore.hbs`,
      },
      {
        type: `add`,
        path: `packages/{{kebabCase name}}/.npmignore`,
        templateFile: `plop-templates/.npmignore.hbs`,
      },
      {
        type: `add`,
        path: `packages/{{kebabCase name}}/src/.gitkeep`,
      },
    ],
  })
}
