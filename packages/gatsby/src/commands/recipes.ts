import telemetry from "gatsby-telemetry"
import execa from "execa"
import path from "path"

module.exports = async (program: IProgram): Promise<void> => {
  const recipe = program._[1]
  telemetry.trackCli(`RECIPE_RUN`, {recipe})

  // Start GraphQL serve
  let subprocess
  // try {
    subprocess = execa(`node`, [`node_modules/gatsby/dist/recipes/graphql.js`], {cwd: program.directory, all: true})
    // subprocess = execa(`echo`, [`world`])
  // } catch(error) {
    // console.log(error)
  // }
  // const subprocess = execa('echo', ['unicorns']);
  let started = false
  subprocess.stdout.on('data', (data) => {
    if (!started) {
      const runRecipe = require(`../recipes/index`)
      runRecipe(recipe)
      started = true
    }
  });
  subprocess.stderr.on('data', (data) => {
    console.log(`Received err chunk: ${data}`);
  });

  // Run command

}
