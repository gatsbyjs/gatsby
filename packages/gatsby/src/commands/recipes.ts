import telemetry from "gatsby-telemetry"
import execa from "execa"
import path from "path"

module.exports = async (program: IProgram): Promise<void> => {
  // TODO add telemetry
  // console.log(program)
  const recipe = program._[1]
  console.log({recipe})
  telemetry.trackCli(`RECIPE_RUN`, {recipe})

  console.log(require.resolve(`../recipes/graphql`))

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
    console.log(data.toString());
    if (!started) {
      const runRecipe = require(`../recipes/index`)
      console.log({runRecipe})
      runRecipe(recipe)
      started = true
    }
  });
  subprocess.stderr.on('data', (data) => {
    console.log(`Received err chunk: ${data}`);
  });

  // Run command

}
