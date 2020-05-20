- [x] Make root configurable/dynamic
- [x] Make recipe configurable (theme-ui/eslint/jest)
- [x] Exit upon completion

- [x] Move into gatsby repo
- [x] Run as a command
- [x] Boot up server as a process
- [x] Then run the CLI
- [x] Clean up server after
- [x] show plan to create or that nothing is necessary & then show in `<static>` what was done

## alpha

- [x] Handle `dev` in NPMPackage
- [x] add Joi for validating resource objects
- [x] handle template strings in JSX parser
- [x] Step by step design
- [x] Use `fs-extra`
- [x] Handle object style plugins
- [x] Improve gatsby-config test
- [x] convert to xstate
- [x] integration test for each resource (read, create, update, delete)
- [x] validate Resource component props.
- [x] reasonably test resources
- [x] add Joi for validating resource objects
- [x] handle error states
- [x] handle template strings in JSX parser
- [x] Make it support relative paths for custom recipes (./src/recipes/foo.mdx)
- [x] Move parsing to the server
- [x] run recipe from url
- [x] Move parsing to the server
- [x] imports from a url
- [x] Document the supported components and trivial guide on recipe authoring
- [x] have File only pull from remote files for now until multiline strings work in MDX
- [x] integration test for each resource (read, create, update, delete)
- [x] update shadow file resource
- [x] handle error states

Kyle

- [x] Make port selection dynamic
- [x] Add large warning to recipes output that this is an experimental feature & might change at any moment + link to docs / umbrella issue for bug reports & discussions
- [x] use yarn/npm based on the user config
- [x] write tests for remote files src in File
- [x] Gatsby recipes list (design and implementation)
- [x] move back to "press enter to run"
- [x] Run gatsby-config.js changes through prettier to avoid weird diffs
- [x] document ShadowFile
- [x] Remove mention of canary release before merging
- [x] write blog post
- [x] move gatsby package to depend on released version of gatsby-recipes

John

- [x] spike on bundling recipes into one file
- [x] print pretty error when there's parsing errors of mdx files
- [x] Move mdx recipes to its own package `gatsby-recipes` & pull them from unpkg
- [x] add CODEOWNERS file for recipes
- [x] give proper npm permissions to `gatsby-recipes`
- [x] validate that the first step of recipes don't have any resources. They should just be for the title/description
- [x] handle not finding a recipe
- [x] test modifying gatsby-config.js from default starter
- [x] get tests passing
- [x] add emotion screenshot and add to readme
- [x] make note about using gists for paths and using the "raw" link
- [x] gatsby-config.js hardening — make it work if there's no plugins set like in hello-world starter

## Near-ish future

- [ ] support Joi.any & Joi.alternatives in joi2graphql for prettier-git-hook.mdx
- [ ] Make a proper "Config" provider to add recipes dir, store data, etc.
- [ ] init.js for providers to setup clients
- [ ] validate resource config
- [ ] Theme UI preset selection (runs dependent install and file write)
- [ ] Failing postinstall scripts cause client to hang
- [ ] Select input supported recipes
- [ ] Refactor resource state to use Redux & record runs in local db
- [ ] move creating the validate function to core and out of resources — they just declare their schema
- [ ] get latest version of npm packages so know if can skip running.
- [ ] Make `dependencyType` in NPMPackage an enum (joi2gql doesn't handle this right now from Joi enums)
- [ ] Show in plan if an update will be applied vs. create.
- [ ] Implement config object for GatsbyPlugin
- [ ] Handle JS in config objects? { **\_javascript: "`\${**dirname}/foo/bar`" }
- [ ] handle people pressing Y & quit if they press "n" (for now)
- [ ] Automatically create list of recipes from the recipes directory (recipes resource 🤔)
- [ ] ShadowFile needs more validation — validate the file to shadow exists.
- [ ] Add eslint support & add Typescript eslint plugins to the typescript recipe.
- [ ] add recipe mdx-pages once we can write out options https://gist.github.com/KyleAMathews/3d763491e5c4c6396e1a6a626b2793ce
- [ ] Add PWA recipe once we can write options https://gist.githubusercontent.com/gillkyle/9e4fa3d019c525aef2f4bd431c806879/raw/f4d42a81190d2cada59688e6acddc6b5e97fe586/make-your-site-a-pwa.mdx
