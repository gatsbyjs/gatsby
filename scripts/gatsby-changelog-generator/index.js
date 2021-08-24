const fs = require(`fs`)
const path = require(`path`)
const stream = require(`stream`)
const execa = require(`execa`)
const { compare, prerelease, patch, gte, lt, parse } = require(`semver`)
const gitRawCommits = require(`git-raw-commits`)
const conventionalCommitsParser = require(`conventional-commits-parser`)
const { renderHeader, renderVersion } = require(`./render`)

class StreamFilter extends stream.Transform {
  constructor(filterCallback) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
    })
    this.filterCallback = filterCallback
  }
  _transform(chunk, encoding, next) {
    if (this.filterCallback(chunk)) {
      return next(null, chunk)
    }
    next()
  }
}

const streamFilter = filterCallback => new StreamFilter(filterCallback)

const monorepoRoot = () => process.cwd()
const changelogPath = packageName =>
  path.join(monorepoRoot(), `packages`, packageName, `CHANGELOG.md`)

// tags are lerna-style: package@version
const tagToVersion = tag => tag.split(`@`)[1]

function getAllPackageNames() {
  return fs
    .readdirSync(path.join(monorepoRoot(), `packages`), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

async function getAllVersions(pkg) {
  // `git tag -l "${pkg}@*"`
  let { stdout } = await execa(`git`, [`tag`, `-l`, `${pkg}@*`])
  return stdout
    .split(/[\r\n]/)
    .map(tagToVersion)
    .sort(compare)
}

async function getTagDate(tag) {
  let result = await execa(`git`, [`rev-list`, `-n`, `1`, tag])
  const hash = String(result.stdout)
  result = await execa(`git`, [`log`, `-1`, `--format=%as`, hash])
  return result.stdout
}

async function getGatsbyRelease(tag) {
  // git log -1 --format=%H gatsby-source-contentful@4.0.0
  let result = await execa(`git`, [`rev-list`, `-n`, `1`, tag])
  const hash = String(result.stdout)
  result = await execa(`git`, [`tag`, `--points-at`, hash])
  const gatsbyPackageTag = result.stdout
    .split(`\n`)
    .find(tag => tag.split(`@`)[0] === `gatsby`)

  if (gatsbyPackageTag) {
    const gatsbyPackageVersion = parse(tagToVersion(gatsbyPackageTag))
    return `${gatsbyPackageVersion.major}.${gatsbyPackageVersion.minor}`
  }
  return ``
}

const stableVersionRegex = /[\d]+\.[\d]+\.[\d]+$/
const isStableVersion = v => prerelease(v) === null
const isBranchCutPreminorVersion = v => {
  const pre = prerelease(v)
  return pre && pre[0] === `next` && pre[1] === 0
}
const haveSameMinor = (v1, v2) => {
  // All patch version with the same
  const tmp1 = parse(v1)
  const tmp2 = parse(v2)
  return tmp1.major === tmp2.major && tmp1.minor === tmp2.minor
}

// Map of messed-up releases
// (e.g. when plugin major changes were merged before bumping its version to -next.0\
// and so are not seen by the changelog-generator)
const tagOverrides = new Map([
  [
    // https://github.com/gatsbyjs/gatsby/commits/gatsby-source-contentful%404.0.0/packages/gatsby-source-contentful
    // (gatsby-source-contentful@4.0.0-next.0 published after commit with a breaking change)
    `gatsby-source-contentful@4.0.0-next.0`,
    `5bc1134c7d7f346bfdab0516e1d8660407dde63d`,
  ],
  [
    // https://github.com/gatsbyjs/gatsby/commits/gatsby-plugin-emotion%405.0.0/packages/gatsby-plugin-emotion
    // (gatsby-plugin-emotion@5.0.0-next.0 published after breaking change)
    `gatsby-plugin-emotion@5.0.0-next.0`,
    `fe8346543838a1eeffd1bb9b1b278e99135a34d1`,
  ],
])

async function buildChangelogEntry(pkg, version, prevVersion) {
  const fromTag = prevVersion ? `${pkg}@${prevVersion}` : ``
  const toTag = version ? `${pkg}@${version}` : ``

  const gitRawCommitsOpts = {
    from: tagOverrides.get(fromTag) || fromTag,
    to: tagOverrides.get(toTag) || toTag,
    path: `./packages/${pkg}`,
    format: "%B%n-hash-%n%H%n-gitTags-%n%d%n-committerDate-%n%cs",
  }
  const gitRawExecOpts = {}
  const commitsStream = gitRawCommits(gitRawCommitsOpts, gitRawExecOpts)

  const parserOpts = {
    headerPattern: /^\s*(\w*)(?:\(([\w\$\.\-\* \,]*)\))?\: (.*)$/,
    headerCorrespondence: [`type`, `scope`, `subject`],
  }
  const stream = commitsStream.pipe(conventionalCommitsParser(parserOpts))

  const commitGroups = new Map([
    [`feat`, []],
    [`fix`, []],
    [`perf`, []],
    [`refactor`, []],
    [`chore`, []],
    [`other`, []],
  ])
  for await (const commit of stream) {
    // Skip redundant "release" commits
    if (commit.type === `chore` && commit.scope === `release`) {
      continue
    }
    const type = commitGroups.has(commit.type) ? commit.type : `other`
    const commitGroup = commitGroups.get(type)
    commitGroup.push(commit)
  }
  const context = {
    version: version,
    fromTag,
    toTag,
    date: await getTagDate(toTag),
    gatsbyRelease: patch(version) === 0 ? await getGatsbyRelease(toTag) : ``,
    pkg,
  }
  return renderVersion(context, commitGroups)
}

function findFirstReleaseProcessVersion(packageName, versions) {
  // Assuming versions are sorted ascending
  const version = versions.find(version => version.endsWith(`-next.0`))
  if (!version) {
    throw new Error(
      `Could not find the first release process version for ${packageName} ` +
        `(searched through ${versions.length} existing tags for version "x.y.z-next.0")`
    )
  }
  return version
}

// function findLatestVersionBeforeReleaseProcess(packageName, versions) {
//   const firstReleaseProcessVersion = findFirstReleaseProcessVersion(
//     packageName,
//     versions
//   )
//   const version = versions.filter(v => lt(v, firstReleaseProcessVersion)).pop()
//   if (!version) {
//     throw new Error(
//       `Could not find the first release process version for ${packageName} ` +
//         `(searched through ${versions.length} existing tags for version "x.y.z-next.0")`
//     )
//   }
//   return version
// }

async function generateChangelog(packageName, fromVersion = null) {
  const allVersions = await getAllVersions(packageName)
  const startVersion =
    fromVersion || findFirstReleaseProcessVersion(packageName, allVersions)

  // Prepare version ranges that we can pass to `git log` to retrieve commits for specific versions.
  // This process relies on Gatsby Release Process convention, e.g.:
  //    [[`2.32.0-next.0`, `2.32.0`],
  //    [`2.32.0`, `2.32.1`]]
  // (we can't do something like [2.31.5, 2.32.0] because those tags are in different branches,
  // and have no common history)
  const branchCutPreminors = allVersions
    .filter(v => isBranchCutPreminorVersion(v) && gte(v, startVersion))
    .reverse()

  const chunks = []
  for (const preMinor of branchCutPreminors) {
    const patches = allVersions.filter(
      v => isStableVersion(v) && haveSameMinor(v, preMinor)
    )
    const ranges = patches
      .map((patch, index) => [
        index === 0 ? preMinor : patches[index - 1],
        patch,
      ])
      .reverse()

    for (const [from, to] of ranges) {
      const chunk = await buildChangelogEntry(packageName, to, from)
      chunks.push(chunk)
    }
  }
  return chunks.join(`\n`)
}

/**
 * Completely regenerate the top part of the changelog with veresions published via the new release process.
 *
 * Relies on presence of `<a name="before-release-process"></a>\n` separator in the CHANGELOG.md
 * document as a demarcation of parts of the document before/after the release process was introduced.
 */
async function regenerateChangelog(packageName) {
  const path = changelogPath(packageName)
  const separator = `<a name="before-release-process"></a>\n`
  const contents = String(fs.readFileSync(path))
  const parts = contents.split(separator)

  if (parts.length !== 2) {
    throw new Error(`Could not find demarcation ${separator.trim()} in ${path}`)
  }
  const releaseProcessChangelog = await generateChangelog(packageName)

  const updatedChangelogParts = [
    renderHeader(packageName),
    releaseProcessChangelog,
    separator,
    parts[1],
  ]

  fs.writeFileSync(path, updatedChangelogParts.join(`\n`))
  console.log(`Updated ${path}`)
}

async function run() {
  const tmp = await regenerateChangelog(`gatsby-plugin-emotion`)

  // for (const pkg of getAllPackageNames()) {
  //   try {
  //     await regenerateChangelog(pkg)
  //   } catch (e) {
  //     console.error(e.message)
  //   }
  // }
}

run().catch(console.error)
