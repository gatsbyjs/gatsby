/**
 * Release of next major
 * ===
 *
 * What does this file do?
 * - it checks if you have publish access
 * - it checks if we have any uncommited files -- if so, we exit
 * - it cleans all non git files to make sure we have clean directory
 * - run patches in patches/v4
 * - commits the patches so lerna can publish
 * - run full boostrap
 * - Publish premajor
 * - cleanup patch commit
 */
const path = require(`path`)
const { spawn, execSync } = require(`child_process`)
const yargs = require(`yargs`)
const glob = require(`glob`)

const argv = yargs
  .command(`publish v4`, `Publishes a v4 alpha release`)
  .option(`registry`, {
    default: `https://registry.npmjs.org`,
    describe: `The NPM registry to publish to`,
    type: `string`,
  }).argv

function promiseSpawn(command, args, options) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, options)

    let error
    proc.on(`error`, err => {
      error = err
    })

    if (proc.stdout) {
      proc.stdout.on(`data`, data => {
        console.log(data.toString())
      })
    }
    if (proc.stderr) {
      proc.stderr.on(`data`, data => {
        console.log(`${data.toString()}`)
      })
    }

    proc.on(`close`, code => {
      if (code === 0) {
        resolve()
      } else {
        reject(error)
      }
    })
  })
}

const patchFiles = glob.sync(`patches/v4/*.patch`, {
  cwd: path.join(__dirname, `..`),
})
let commitCreated = false

;(async () => {
  try {
    // check access
    await promiseSpawn(
      process.execPath,
      [`./scripts/check-publish-access/index.js`],
      {
        cwd: path.resolve(__dirname, `../`),
      }
    )

    const bumpType = `major`
    const tagName = `alpha-v4`
    const preId = `alpha-v4`

    try {
      await Promise.all([
        promiseSpawn(`git`, [`diff`, `--quiet`]),
        promiseSpawn(`git`, [`diff`, `--quiet`, `--cached`]),
      ])
    } catch (err) {
      throw new Error(
        `Make sure to commit all your changes, before running a release`
      )
    }

    // Remove all dist files so we can recompile cleanly
    await promiseSpawn(
      process.execPath,
      [`./scripts/clear-package-dir.js`, bumpType],
      {
        cwd: path.resolve(__dirname, `../`),
        stdio: [`inherit`, `inherit`, `inherit`],
      }
    )

    console.log(` `)
    console.log(`=== APPLYING GIT PATCHES ===`)

    patchFiles.forEach(file => {
      console.log(`Applying patch ${file}`)
      try {
        execSync(`git apply ${file}`, {
          cwd: path.join(__dirname, `..`),
          stdio: `pipe`,
        })
      } catch (err) {
        console.log(err.stderr.toString())
        // eslint-disable-next-line
        throw ``
      }
    })

    console.log(`=== COMMITING PATCH FILES ===`)
    try {
      await promiseSpawn(
        `git`,
        [`commit`, `-am`, `Comitting patch files changes`],
        {
          cwd: path.resolve(__dirname, `../`),
          stdio: [`inherit`, `inherit`, `inherit`],
        }
      )
      commitCreated = true
    } catch (err) {
      console.log({ err })
    }

    let COMPILER_OPTIONS = ``
    if (argv.type === `v4`) {
      COMPILER_OPTIONS = `GATSBY_MAJOR=4`
    }

    console.log(` `)
    console.log(`=== BUILDING V4 ALPHA ===`)
    await promiseSpawn(`yarn`, [`bootstrap`], {
      shell: true,
      env: {
        COMPILER_OPTIONS,
      },
      stdio: [`inherit`, `inherit`, `inherit`],
    })

    console.log(` `)
    console.log(`=== PUBLISHING V4 ALPHA ===`)
    await promiseSpawn(
      process.execPath,
      [
        `./node_modules/lerna/cli.js`,
        `publish`,
        `--canary`,
        `premajor`,
        `--ignore-scripts`,
        `--exact`,
        `--preid`,
        preId,
        `--pre-dist-tag`,
        tagName,
        `--force-publish`, // publish all
        `--registry`,
        argv.registry,
      ],
      {
        cwd: path.resolve(__dirname, `../`),
        stdio: [`inherit`, `inherit`, `inherit`],
      }
    )
  } catch (err) {
    if (err) {
      console.log(err)
    }
  } finally {
    console.log(` `)
    console.log(`=== CLEANING UP ===`)
    if (commitCreated) {
      console.log(`REMOVING PATCH COMMIT`)
      try {
        await promiseSpawn(`git`, [`reset`, `--hard`, `HEAD~1`], {
          cwd: path.resolve(__dirname, `../`),
          stdio: [`inherit`, `inherit`, `inherit`],
        })
      } catch (err) {
        console.error(
          new Error(
            `We couldn't revert the patch commit. Please do this manually`
          )
        )
      }
    }
  }
})()
