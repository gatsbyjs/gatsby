import path from 'path'
import execa from 'execa'
import process from 'process'

export const transformerDirectory = path.join(__dirname, '../', 'transforms')
export const jscodeshiftExecutable = require.resolve('.bin/jscodeshift')

export function runTransform(transform, targetDir) {
  const transformerPath = path.join(transformerDirectory, `${transform}.js`)

  let args = []

  args.push('--ignore-pattern=**/node_modules/**') //TODO ignore cache and public
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
  let userInput = process.argv

  runTransform(userInput[2], userInput[3])
}
