const fs = require(`fs`)
const path = require(`path`)
const execa = require(`execa`)
const { compare, prerelease, patch, gt, parse, valid } = require(`semver`)
const gitRawCommits = require(`git-raw-commits`)
const conventionalCommitsParser = require(`conventional-commits-parser`)
const dateFormat = require(`dateformat`)
const { renderHeader, renderVersion } = require(`./render`)

const monorepoRoot = () => process.cwd()

function getDirnameFromPackageName(packageName) {
  return packageNameToDirname.get(packageName)
}

const changelogRelativePath = packageName =>
  path.join(`packages`, getDirnameFromPackageName(packageName), `CHANGELOG.md`)

const changelogPath = packageName =>
  path.join(monorepoRoot(), changelogRelativePath(packageName))

// Tags are lerna-style: package@version
// But scoped packages start with `@gatsbyjs/` so in these cases the second part is the version
const tagToVersion = tag => {
  const split = tag.split(`@`)
  if (tag.startsWith(`@gatsbyjs/`)) {
    return split[2]
  }
  return split[1]
}

// Scoped packages have a different folder name than the package name
// This is a map of package name <-> folder name
const packageNameToDirname = new Map()

// Return list of package names (tries name in package.json first and falls back to directory name)
// Also fills the packageNameToDirname map
function getAllPackageNames() {
  return fs
    .readdirSync(path.join(monorepoRoot(), `packages`), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => {
      try {
        const localPkg = JSON.parse(
          fs.readFileSync(
            path.join(monorepoRoot(), `packages`, dirent.name, `package.json`)
          )
        )

        if (localPkg && localPkg.name) {
          packageNameToDirname.set(localPkg.name, dirent.name)
        }

        return localPkg.name
      } catch (error) {
        // fallback to generic one
      }

      packageNameToDirname.set(dirent.name, dirent.name)

      return dirent.name
    })
}

async function getAllVersions(pkg) {
  // `git tag -l "${pkg}@*"`
  const { stdout } = await execa(`git`, [`tag`, `-l`, `${pkg}@*`])
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

async function buildChangelogEntry(context) {
  const { pkg, version, date, fromTag, toTag, gatsbyRelease = `` } = context

  // See https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/git-raw-commits
  const gitRawCommitsOpts = {
    from: fromTag,
    to: toTag,
    path: `./packages/${pkg}`,
    format: `%B%n-hash-%n%H%n-gitTags-%n%d%n-committerDate-%n%cs`,
  }
  const gitRawExecOpts = {}
  const commitsStream = gitRawCommits(gitRawCommitsOpts, gitRawExecOpts)

  // See https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser
  const parserOpts = {
    headerPattern: /^\s*(\w*)(?:\(([\w$.\-* ,]*)\))?: (.*)$/,
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
  const ignoredChores = new Set([`release`, `changelogs`])

  for await (const commit of stream) {
    // Skip redundant commits (releases, changelog updates)
    if (commit.type === `chore` && ignoredChores.has(commit.scope)) {
      continue
    }
    const type = commitGroups.has(commit.type) ? commit.type : `other`
    const commitGroup = commitGroups.get(type)
    commitGroup.push(commit)
  }
  return renderVersion(context, commitGroups)
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
  [
    // https://github.com/gatsbyjs/gatsby/commits/gatsby-plugin-utils%403.0.0/packages/gatsby-plugin-utils
    // (gatsby-plugin-utils@3.0.0-next.0 published after commit with a breaking change)
    `gatsby-plugin-utils@3.0.0-next.0`,
    `05f971929f68eccc14686ef556f7f577e3771c0d`,
  ],
])

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
  for (const [fromVersion, toVersion] of versionRanges.reverse()) {
    const fromTag = `${packageName}@${fromVersion}`
    const toTag = `${packageName}@${toVersion}`

    const chunk = await buildChangelogEntry({
      pkg: packageName,
      version: toVersion,
      fromTag: tagOverrides.get(fromTag) || fromTag,
      toTag: tagOverrides.get(toTag) || toTag,
      date: await getTagDate(toTag),
      gatsbyRelease:
        patch(toVersion) === 0 ? await resolveGatsbyRelease(toTag) : ``,
    })
    chunks.push(chunk)
  }
  return chunks.join(`\n\n`)
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
    `\n\n`,
    changeLog,
    `\n\n`,
    separator,
    parts[1],
  ]

  fs.writeFileSync(path, updatedChangelogParts.join(``))
  console.log(`Updated ${path}`)
}

function addChangelogEntries(packageName, entries, contents) {
  contents = contents || String(fs.readFileSync(changelogPath(packageName)))
  const header = renderHeader(packageName)
  const updatedChangelogParts = [
    header,
    entries.trimRight(),
    contents.slice(header.length).trimStart(),
  ]
  fs.writeFileSync(
    changelogPath(packageName),
    updatedChangelogParts.join(`\n\n`)
  )
}

/**
 * Add new versions to the changelog starting from the most recent version listed there
 * (incremental updates)
 */
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
    return false
  }

  addChangelogEntries(packageName, changeLog, contents)
  console.log(`Updated ${path}`)
  return true
}

/**
 * Hook into publishing process and add new release entry to changelog.
 *
 * Should be used inside lerna "version" hook (version is changed in package.json but not committed/tagged yet).
 * See https://github.com/lerna/lerna/tree/main/commands/version#lifecycle-scripts
 */
async function onNewVersion() {
  // get list of changed files (package.json of published packages are expected to be dirty)
  const { stdout } = await execa(`git`, [`ls-files`, `-m`])
  const packages = String(stdout).split(`\n`).map(toPackageName).filter(Boolean)
  const gatsbyVersion = packages.includes(`gatsby`)
    ? parse(resolvePackageVersion(`gatsby`))
    : undefined

  const updatedChangelogs = []
  for (const packageName of packages) {
    try {
      // Get the version to be published:
      const version = resolvePackageVersion(packageName)

      // Ignore pre-releases
      if (!isStableVersion(version)) continue

      // Get the most recent version to compare against
      const allVersions = await getAllVersions(packageName)
      const lastVersion = allVersions
        .filter(v => isStableVersion(v) || isBranchCutPreminorVersion(v))
        .slice(-1)

      const entry = await buildChangelogEntry({
        pkg: packageName,
        version,
        fromTag: lastVersion ? `${packageName}@${lastVersion}` : ``,
        toTag: `HEAD`,
        date: dateFormat(new Date(), `yyyy-mm-dd`),
        gatsbyRelease:
          gatsbyVersion && gatsbyVersion.patch === 0
            ? `${gatsbyVersion.major}.${gatsbyVersion.minor}`
            : ``,
      })

      if (entry) {
        addChangelogEntries(packageName, entry)
        updatedChangelogs.push(changelogRelativePath(packageName))
      }
    } catch (error) {
      console.error(`package "${packageName}": ${error.stack}`)
    }
  }
  if (updatedChangelogs.length) {
    await execa(`git`, [`add`, ...updatedChangelogs])
  }

  function toPackageName(path) {
    const parts = path.split(/[\\/]+/)
    return parts[parts.length - 1] === `package.json` &&
      parts[parts.length - 3] === `packages`
      ? parts[parts.length - 2]
      : undefined
  }

  function resolvePackageVersion(packageName) {
    const packagePath = path.join(`packages`, packageName, `package.json`)
    return JSON.parse(fs.readFileSync(packagePath)).version
  }
}

exports.getAllPackageNames = getAllPackageNames
exports.regenerateChangelog = regenerateChangelog
exports.updateChangelog = updateChangelog
exports.onNewVersion = onNewVersion
exports.changelogRelativePath = changelogRelativePath
