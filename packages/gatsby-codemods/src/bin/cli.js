import path from 'path'
import execa from 'execa'
import chalk  from 'chalk'

const codemods = [`gatsby-plugin-image`, `global-graphql-calls`, `import-link`, `navigate-calls`, `rename-bound-action-creators`]

export const transformerDirectory = path.join(__dirname, '../', 'transforms')
export const jscodeshiftExecutable = require.resolve('.bin/jscodeshift')

export function runTransform(transform, targetDir) {
  const transformerPath = path.join(transformerDirectory, `${transform}.js`)

  let args = []

  args.push('--ignore-pattern=**/node_modules/**') 
  args.push('--ignore-pattern=**/.cache/**') 
  args.push('--ignore-pattern=**/public/**') 

  args.push('--extensions=jsx,js,ts,tsx')
  
  args = args.concat(['--transform', transformerPath, targetDir])

  console.log(`Executing command: jscodeshift ${args.join(' ')}`);

  const result = execa.sync(jscodeshiftExecutable, args, {
    stdio: 'inherit',
    stripEof: false
  })

  if (result.error) {
    throw result.error
  }
}
  
export function run() {
  let [transform, targetDir] = process.argv.slice(2)

  if (!transform) {
    console.log(chalk.red(`Be sure to pass in the name of the codemod you're attempting to run.`))
    return
  }

  if (!codemods.includes(transform)) {
    console.log(`${chalk.red("You have passed in invalid codemod name:")} ${chalk.bold.underline(transform)}. ${chalk.red("Please pass in one of the following")} ${chalk.underline(codemods.join(", "))}.`)
    return
  }

  if(!targetDir) {
    console.log(chalk.red(`You have not provided a target directory to run the codemod against, will default to root.`))
    targetDir = `./`
    
  }
  runTransform(transform, targetDir)
}
