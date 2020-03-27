import spawn from "cross-spawn"

// in linux environments joining with the __dirname causes ENONT results from OS
// read operations. but in bash environments its required.
const getOSAppropriatePath = path =>
  process.env.CI ? path : join(__dirname, path)

export function invokeCli(...args) {
  const results = spawn.sync(getOSAppropriatePath("./gatsby-cli.js"), args, {
    cwd: getOSAppropriatePath("../execution-folder"),
    shell: !!process.env.CI,
  })

  if (results.error) {
    console.log(results.error)
    return [1, results.error.toString()]
  }

  return [results.status, results.output.join("")]
}
