/**
 * Release of next major
 * ===
 *
 * What does this file do?
 * - it checks if you have publish access
 * - it checks if we have any uncommited files -- if so, we exit
 * - it cleans all non git files to make sure we have clean directory
 * - run patches in patches/v5
 * - commits the patches so lerna can publish
 * - run full boostrap
 * - Publish premajor
 * - cleanup patch commit
 */
const path = require(`path`)
const { spawn, execSync } = require(`child_process`)
const yargs = require(`yargs`)
const glob = require(`glob`)

const gatsbyPKG = require(`../packages/gatsby/package.json`)
const nextMajor = String(Number(gatsbyPKG.version.match(/[^.]+/)[0]) + 1)

const argv = yargs
  .command(`publish`, `Publishes a next-major alpha release`)
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

const patchFiles = glob.sync(`patches/v${nextMajor}/*.patch`, {
  cwd: path.join(__dirname, `..`),
})
let commitCreated = false
let currentGitHash = null

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

    const d = new Date()
    const postFixString = `d${d.getUTCFullYear().toString().padStart(4, `0`)}${(
      d.getUTCMonth() + 1
    )
      .toString()
      .padStart(2, `0`)}${d.getUTCDate().toString().padStart(2, `0`)}t${d
      .getUTCHours()
      .toString()
      .padStart(2, `0`)}${d.getUTCMinutes().toString().padStart(2, `0`)}${d
      .getUTCSeconds()
      .toString()
      .padStart(2, `0`)}`

    const bumpType = `major`
    const tagName = `alpha-v${nextMajor}`
    const preId = `alpha-v${nextMajor}.${postFixString}`
    // TODO swap back to above.
    // const tagName = `alpha-9689ff`
    // const preId = `alpha-9689ff`

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
    currentGitHash = execSync(`git rev-parse HEAD`)
      .toString()
      .replace(/[\r\n]/, ``)

    if (!currentGitHash) {
      throw new Error(`The current commit hash could not be determined.`)
    }
    try {
      await promiseSpawn(
        `git`,
        [`commit`, `-am`, `Comitting patch files changes`, `--no-verify`],
        {
          cwd: path.resolve(__dirname, `../`),
          stdio: [`inherit`, `inherit`, `inherit`],
        }
      )
      commitCreated = true
    } catch (err) {
      // no catch
    }

    const COMPILER_OPTIONS = `GATSBY_MAJOR=${nextMajor}`

    console.log(` `)
    console.log(`=== BUILDING V${nextMajor} ALPHA ===`)
    await promiseSpawn(`yarn`, [`bootstrap`], {
      shell: true,
      env: {
        ...process.env,
        COMPILER_OPTIONS,
      },
      stdio: [`inherit`, `inherit`, `inherit`],
    })

    try {
      await promiseSpawn(
        `git`,
        [`commit`, `-am`, `Comitting yarn changes`, `--no-verify`],
        {
          cwd: path.resolve(__dirname, `../`),
          stdio: [`inherit`, `inherit`, `inherit`],
        }
      )
      commitCreated = true
    } catch (err) {
      // no catch
    }

    console.log(` `)
    console.log(`=== PUBLISHING V${nextMajor} ALPHA ===`)
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
        await promiseSpawn(`git`, [`reset`, `--hard`, currentGitHash], {
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
