const fs = require(`fs`)
const path = require(`path`)
const stream = require(`stream`)
const execa = require(`execa`)
const { compare, prerelease, patch, gt, lt, parse, valid } = require(`semver`)
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

/**
 * E.g. resolveGatsbyRelease(`gatsby-plugin-emotion@6.11.0`) returns `3.11`
 * Useful to link release notes in the changelog
 */
async function resolveGatsbyRelease(tag) {
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

const isStableVersion = v => prerelease(v) === null
const isBranchCutPreminorVersion = v => v.endsWith(`.0-next.0`)

function findFirstReleaseProcessVersion(packageName, versions) {
  // Assuming versions are sorted in ascending order
  const version = versions.find(version => version.endsWith(`-next.0`))
  if (!version) {
    throw new Error(
      `Could not find the first release process version for ${packageName} ` +
        `(searched through ${versions.length} existing tags for version "x.y.z-next.0")`
    )
  }
  return version
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
  [
    // https://github.com/gatsbyjs/gatsby/commits/gatsby-source-wordpress%404.0.0/packages/gatsby-source-wordpress
    // (no pre-minor tag at all)
    `gatsby-source-wordpress@4.0.0-next.0`,
    `7797522184600284a44929cad5b27f2388eb13ee`,
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
    gatsbyRelease:
      patch(version) === 0 ? await resolveGatsbyRelease(toTag) : ``,
    pkg,
  }
  return renderVersion(context, commitGroups)
}

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
  const stableVersions = allVersions.filter(
    v => isStableVersion(v) && gt(v, startVersion)
  )
  const preMinors = allVersions.filter(isBranchCutPreminorVersion)

  const versionRanges = stableVersions.map((v, index, all) => {
    if (index === 0) return [startVersion, v]
    if (patch(v) === 0) {
      // The key part: any minor should be compared with corresponding branch-cut pre-minor (not previous tag)
      const preMinor = `${v}-next.0`
      if (
        !preMinors.includes(preMinor) &&
        !tagOverrides.has(`${packageName}@${preMinor}`)
      ) {
        throw new Error(
          `Cannot generate changelog entry for ${packageName}@${v}: missing corresponding pre-minor tag ${preMinor}`
        )
      }
      return [preMinor, v]
    }
    return [all[index - 1], v]
  })

  const chunks = []
  for (const [from, to] of versionRanges.reverse()) {
    const chunk = await buildChangelogEntry(packageName, to, from)
    chunks.push(chunk)
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
  const separator = `<a name="before-release-process"></a>`
  const contents = String(fs.readFileSync(path))
  const parts = contents.split(separator)

  if (parts.length !== 2) {
    throw new Error(`Could not find demarcation ${separator.trim()} in ${path}`)
  }
  const changeLog = await generateChangelog(packageName)

  const updatedChangelogParts = [
    renderHeader(packageName),
    `\n`,
    changeLog,
    `\n`,
    separator,
    parts[1],
  ]

  fs.writeFileSync(path, updatedChangelogParts.join(``))
  console.log(`Updated ${path}`)
}

async function updateChangelog(packageName) {
  const path = changelogPath(packageName)
  const contents = String(fs.readFileSync(path))
  const match = contents.match(/([0-9]+\.[0-9]+\.[0-9]+)/)
  const latestVersion = match ? match[1] : undefined
  if (!valid(latestVersion)) {
    throw new Error(
      `Could not resolve the latest version of ${packageName} in ${path}`
    )
  }
  const changeLog = await generateChangelog(packageName, latestVersion)
  if (!changeLog) {
    console.log(
      `Skipping ${packageName}: no new versions after ${latestVersion}`
    )
    return
  }
  const header = renderHeader(packageName)
  const updatedChangelogParts = [
    header,
    changeLog.trimRight(),
    contents.substr(header.length),
  ]

  fs.writeFileSync(path, updatedChangelogParts.join(`\n`))
  console.log(`Updated ${path}`)
}

exports.getAllPackageNames = getAllPackageNames
exports.regenerateChangelog = regenerateChangelog
exports.updateChangelog = updateChangelog
