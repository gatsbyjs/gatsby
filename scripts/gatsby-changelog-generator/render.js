const { patch } = require(`semver`)

const groupTitles = new Map([
  ["feat", "Features"],
  ["fix", "Bug Fixes"],
  ["perf", "Performance Improvements"],
  ["refactor", "Refactoring"],
  ["chore", "Chores"],
])

/**
 * @param {Object} context
 * @param {Map<string, Array<Object>>} commitsByType
 * @returns string
 */
exports.renderVersion = function renderVersion(context, commitsByType) {
  const { pkg, fromTag, toTag, version, date } = context
  const isPatch = patch(version) !== 0
  const commitGroups = Array.from(commitsByType)
  const hasCommits = commitGroups.some(([_, commits]) => commits.length > 0)
  const compareUrl = `https://github.com/gatsbyjs/gatsby/compare/${fromTag}..${toTag}`

  return `
##${isPatch ? `#` : ``} [${version}](${compareUrl}) (${date})

${
  hasCommits
    ? commitGroups.map(renderCommitGroup).filter(Boolean).join(`\n\n`)
    : `**Note:** Version bump only for package ${pkg}`
}
`
}

renderCommitGroup = function renderCommitGroup(commitGroup) {
  const [type, commits] = commitGroup
  const title = groupTitles.get(type) ?? `Other Changes`

  if (!commits.length) {
    return ``
  }

  return `
#### ${title}

${commits.map(renderCommitLine).join(`\n`)}
`.trim()
}

function renderCommitLine(commit) {
  // Clean up PR references at the end of the subject
  const subject = (commit.subject || commit.header).replace(
    /(\s*\(\#[\d]+\)\s*)*$/,
    ``
  )
  return `- ${subject} ${commitReferences(commit)} ${commitHash(commit)}`
}

function commitReferences(commit) {
  return commit.references.map(ref => commitReference(commit, ref)).join(` `)
}

function commitReference(commit, reference) {
  if (!reference) return ``
  return `[#${reference.issue}](https://github.com/gatsbyjs/gatsby/issues/${reference.issue})`
}

function commitHash(commit) {
  if (!commit.hash) return ``
  const shortHash = commit.hash.substr(0, 7)
  return `([${shortHash}](https://github.com/gatsbyjs/gatsby/commit/${commit.hash}))`
}

/* Expected commit structure
{
  type: 'fix',
  scope: 'deps',
  subject: 'update dependency chalk to ^4.1.2 (#32576)',
  merge: null,
  header: 'fix(deps): update dependency chalk to ^4.1.2 (#32576)',
  body: 'Co-authored-by: Renovate Bot <bot@renovateapp.com>',
  footer: null,
  notes: [],
  references: [
    {
      action: null,
      owner: null,
      repository: null,
      issue: '32576',
      raw: 'fix(deps): update dependency chalk to ^4.1.2 (#32576',
      prefix: '#'
    }
  ],
  mentions: [ 'renovateapp' ],
  revert: null,
  hash: '5c4e109313cd1b59f814332fdb4dfdcaf1faed1a',
  gitTags: '',
  committerDate: '2021-08-02'
}
 */
