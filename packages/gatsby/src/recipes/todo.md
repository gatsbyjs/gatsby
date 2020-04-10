- [x] Make root configurable/dynamic
- [x] Make recipe configurable (theme-ui/eslint/jest)
- [x] Exit upon completion

- [x] Move into gatsby repo
- [x] Run as a command
- [x] Boot up server as a process
- [x] Then run the CLI
- [x] Clean up server after

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
- [ ] Make port selection dynamic
- [ ] Make `dependencyType` in NPMPackage an enum (joi2gql doesn't handle this right now from Joi enums)
- [ ] Add large warning to recipes output that this is an experimental feature & might change at any moment + link to docs / umbrella issue for bug reports & discussions
- [ ] use yarn/npm based on the user config
- [ ] show plan to create/update or that nothing is necessary & then show in `<static>` what was done
- [ ] integration test for each resource (read, create, update, delete)
- [ ] finish shadow file
- [ ] run recipe from url
- [ ] Implement config object for GatsbyPlugin
- [ ] Handle JS in config objects? { **\_javascript: "`\${**dirname}/foo/bar`" }
- [ ] Gatsby recipes list (design and implementation)
- [ ] Move gatsby/src/recipes to its own package `gatsby-recipes`
- [ ] Document the supported components and trivial guide on recipe authoring (help)
- [ ] handle error states
- [ ] have File only pull from remote files for now until multiline strings work in MDX
- [ ] diff all resource changes
- [ ] move code to its own package `gatsby-recipes`
- [ ] handle not finding a recipe
- [ ] write up testing doc ASAP so internal folks can try it
- [ ] write blog post

## Near-ish future

- [ ] Make a proper "Config" provider to add recipes dir, store data, etc.
- [ ] init.js for providers to setup clients
- [ ] validate resource config
- [ ] Theme UI preset selection (runs dependent install and file write)
- [ ] Select input supported recipes
- [ ] Refactor resource state to use Redux & record runs in local db
- [ ] move creating the validate function to core and out of resources — they just declare their schema
