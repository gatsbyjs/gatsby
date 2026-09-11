#!/usr/bin/env node
/**
 * Publishes every public package in `packages/` whose version isn't on the
 * registry yet.
 *
 * Versioning is owned by release-please: merging its release PR writes the
 * version bumps and CHANGELOG entries and creates the tags, and the publish job
 * in `.github/workflows/release-please.yml` then runs this script.
 *
 * npm accepts publishes only from that workflow, via trusted publishing.
 *
 * Deciding what to publish by asking the registry (rather than parsing the
 * commit message or reading tags) keeps this idempotent: a release that fails
 * halfway through - or a package that was rate limited - is fixed by re-running,
 * which picks up only what is still missing.
 */

const fs = require(`fs`)
const path = require(`path`)
const { execFile } = require(`child_process`)
const { getPackages } = require(`@lerna/project`)
const filterPackages = require(`@lerna/filter-packages`)
const { toposort } = require(`@lerna/query-graph`)

const rootPath = path.join(__dirname, `..`)

// The registry tolerates this comfortably and it keeps the check to a few
// seconds for ~100 packages
const REGISTRY_CONCURRENCY = 10

// ~100 registry lookups per run reliably turn up the occasional timeout
const REGISTRY_ATTEMPTS = 3

const delay = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    execFile(command, args, options, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout
        error.stderr = stderr
        reject(error)
        return
      }
      resolve({ stdout, stderr })
    })
  })

// `graphType: "dependencies"` graphs `dependencies` + `optionalDependencies` and
// leaves out devDependencies, so packages are published before anything that needs
// them to resolve at install time.
async function readPackages() {
  const packages = await getPackages(rootPath)
  // last arg is `includePrivate` - private packages are never published
  const publishable = filterPackages(packages, [], [], false)

  return toposort(publishable, { graphType: `dependencies` })
}

async function isPublished({ name, version }, attempt = 1) {
  try {
    const { stdout } = await run(`npm`, [
      `view`,
      `${name}@${version}`,
      `version`,
    ])
    // Some npm versions answer an unknown version with an empty success
    // rather than an error
    return stdout.trim() !== ``
  } catch (error) {
    const output = `${error.stdout || ``}${error.stderr || ``}`
    const isMissing =
      output.includes(`E404`) ||
      output.includes(`No match found`) ||
      output.includes(`is not in this registry`)

    if (isMissing) {
      return false
    }
    if (attempt < REGISTRY_ATTEMPTS) {
      console.log(`  ${name}@${version}: lookup failed, retrying (${attempt})`)
      await delay(attempt * 1000)
      return isPublished({ name, version }, attempt + 1)
    }
    throw new Error(
      `Could not determine whether ${name}@${version} is published:\n${output}`
    )
  }
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length)
  let cursor = 0

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++
        results[index] = await mapper(items[index])
      }
    })
  )
  return results
}

// No package has its own LICENSE - lerna copied the root one into each package
// directory for the duration of the pack, so every published tarball has one.
// Keep doing that: npm includes LICENSE regardless of `files`/.npmignore.
function withRootLicenses(packages) {
  const source = path.join(rootPath, `LICENSE`)
  const copied = packages
    .map(pkg => path.join(pkg.location, `LICENSE`))
    .filter(target => !fs.existsSync(target))

  copied.forEach(target => fs.copyFileSync(source, target))

  return () => copied.forEach(target => fs.rmSync(target, { force: true }))
}

async function main() {
  const packages = await readPackages()

  console.log(`Checking ${packages.length} packages against the registry...`)

  const published = await mapWithConcurrency(
    packages,
    REGISTRY_CONCURRENCY,
    isPublished
  )
  const pending = packages.filter((_, index) => !published[index])

  if (!pending.length) {
    console.log(
      `Nothing to publish - every package version is already on the registry`
    )
    return
  }

  console.log(`\nPublishing ${pending.length} package(s):`)
  pending.forEach(({ name, version }) => console.log(`  ${name}@${version}`))
  console.log(``)

  const args = [`publish`, `--access`, `public`, `--provenance`]
  const removeLicenses = withRootLicenses(pending)

  try {
    for (const [index, pkg] of pending.entries()) {
      console.log(`> npm ${args.join(` `)} (${pkg.name}@${pkg.version})`)
      try {
        // this is just to not accidentally publish anything yet
        throw new Error(
          `Publishing is disabled for safety - remove this line to enable`
        )
        // const { stdout } = await run(`npm`, args, { cwd: pkg.location })
        // console.log(stdout.trim())
      } catch (error) {
        // Stop rather than carry on: the packages after this one may depend on the
        // version that just failed, and publishing them would put manifests on the
        // registry pointing at something that isn't there.
        const remaining = pending.slice(index + 1)
        console.log(`${error.stdout || ``}${error.stderr || ``}`)
        console.log(
          `\nFAILED ${pkg.name}@${pkg.version} - stopping with ${remaining.length} ` +
            `package(s) left to publish.\n` +
            `Re-run once the cause is fixed; publishing resumes from what is still missing.`
        )
        process.exitCode = 1
        return
      }
    }
  } finally {
    removeLicenses()
  }

  console.log(`\nPublished ${pending.length} package(s)`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
