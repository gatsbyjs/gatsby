const fs = require(`fs`)
const path = require(`path`)
const stream = require(`stream`)
const execa = require(`execa`)
const { compare, prerelease, patch, gte, lt, parse } = require(`semver`)
const gitRawCommits = require(`git-raw-commits`)
const conventionalCommitsParser = require(`conventional-commits-parser`)
const { renderVersion } = require(`./render`)

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

// tags are lerna-style: package@version
const tagToVersion = tag => tag.split(`@`)[1]

function comparePackageVersions(tag1, tag2) {
  return compare(tagToVersion(tag1), tagToVersion(tag2))
}

async function getAllGitTags(pkg) {
  // `git tag -l "${pkg}@*"`
  let { stdout } = await execa(`git`, [`tag`, `-l`, `${pkg}@*`])
  return stdout.split(/[\r\n]/).sort(comparePackageVersions)
}

async function getTagDate(tag) {
  let result = await execa(`git`, [`rev-list`, `-n`, `1`, tag])
  const hash = String(result.stdout)
  result = await execa(`git`, [`log`, `-1`, `--format=%as`, hash])
  return result.stdout
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

async function buildChangelogEntry(pkg, from, to) {
  const fromTag = from ? `${pkg}@${from}` : ``
  const toTag = to ? `${pkg}@${to}` : ``

  const gitRawCommitsOpts = {
    from: fromTag,
    to: toTag,
    path: `./packages/${pkg}`,
    format: "%B%n-hash-%n%H%n-gitTags-%n%d%n-committerDate-%n%cs",
  }
  const gitRawExecOpts = {}
  const commitsStream = gitRawCommits(gitRawCommitsOpts, gitRawExecOpts)

  const parserOpts = {
    headerPattern:
      /^\s*(\w*)(?:\(([\w\$\.\-\* \,]*)\))?\: (.*)$/,
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
    version: to,
    fromTag,
    toTag,
    date: await getTagDate(`${pkg}@${to}`),
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

async function generateChangelog(packageName, fromVersion = null) {
  const allTags = await getAllGitTags(packageName)

  const allVersions = allTags.map(tagToVersion)
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
      const result = await buildChangelogEntry(packageName, from, to)
      process.stdout.write(result + `\n`)
    }
  }
}

async function run() {
  // FIXME
  await generateChangelog(`gatsby`)
}

run().catch(console.error)
