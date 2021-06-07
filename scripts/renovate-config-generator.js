const path = require(`path`)
const glob = require(`glob`)
const fs = require(`fs-extra`)
const semver = require(`semver`)

const ROOT_DIR = path.join(__dirname, `..`)
const packageRules = new Map()

// our default rules
const defaultPackageRules = [
  // disable engine upgrades
  {
    depTypeList: [`engines`],
    enabled: false,
  },
  {
    packageNames: [`gatsby-interface`],
    // update internal packages immediately after publish instead of waiting 3 days
    stabilityDays: 0,
  },
  {
    groupName: `starters and examples`,
    matchPaths: [`starters/**`, `examples/**`],
    schedule: `before 7am on Monday`,
    automerge: true,
  },
  {
    extends: [`monorepo:gatsby`],
    groupName: `starters and examples - Gatsby`,
    matchPaths: [`starters/**`, `examples/**`],
    automerge: true,
    stabilityDays: 0,
    prPriority: 50,
    schedule: `at any time`,
  },
  {
    groupName: `remark docs linting`,
    updateTypes: [`major`, `minor`, `patch`, `pin`],
    matchPaths: [`+(package.json)`],
    packageNames: [`remark`, `retext`],
    packagePatterns: [`^remark-`, `^retext-`],
    dependencyDashboardApproval: false,
    excludePackageNames: [`remark-mdx`, `remark-mdxjs`],
  },
  {
    groupName: `eslint`,
    updateTypes: [`major`, `minor`, `patch`, `pin`],
    matchPaths: [`+(package.json)`],
    packageNames: [`eslint`, `prettier`],
    packagePatterns: [`^eslint-`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `cross-env`,
    matchPaths: [`+(package.json)`, `packages/**`],
    packageNames: [`cross-env`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `mini-css-extract-plugin`,
    matchPaths: [`+(package.json)`, `packages/**`],
    packageNames: [`mini-css-extract-plugin`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `typescript`,
    matchPaths: [`+(package.json)`, `packages/**`],
    packageNames: [`typescript`],
    packagePatterns: [`^@typescript-eslint/`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `babel monorepo`,
    matchPaths: [`+(package.json)`, `packages/**`],
    sourceUrlPrefixes: [`https://github.com/babel/babel`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `lodash monorepo`,
    matchPaths: [`+(package.json)`, `packages/**`],
    sourceUrlPrefixes: [`https://github.com/lodash`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `gatsby monorepo`,
    matchPaths: [`+(package.json)`],
  },
]
const monorepoPackages = glob
  .sync(`packages/*/package.json`)
  .map(file => file.match(/packages\/([^/]+)/)[1])

// generate package specific groups
monorepoPackages.forEach(pkg => {
  const preFirstMajorPackages = []
  try {
    const pkgJson = fs.readJSONSync(
      path.join(ROOT_DIR, `packages`, pkg, `package.json`)
    )

    for (const dep in pkgJson.dependencies) {
      if (
        pkgJson.dependencies[dep] &&
        (pkgJson.dependencies[dep].startsWith(`~0.`) ||
          pkgJson.dependencies[dep].startsWith(`^0.`))
      ) {
        preFirstMajorPackages.push(dep)
      }
    }
  } catch (err) {
    // ignore
  }

  const packageRule = [
    {
      matchPaths: [`packages/${pkg}/package.json`],
      matchDepTypes: [`devDependencies`],
      matchUpdateTypes: [`patch`, `minor`],
      groupName: `[DEV] minor and patch dependencies for ${pkg}`,
      groupSlug: `${pkg}-dev-minor`,
      automerge: true,
    },
    {
      matchPaths: [`packages/${pkg}/package.json`],
      matchDepTypes: [`devDependencies`],
      matchUpdateTypes: [`major`],
      groupName: `[DEV] major dependencies for ${pkg}`,
      groupSlug: `${pkg}-dev-major`,
      automerge: true,
    },
    {
      matchPaths: [`packages/${pkg}/package.json`],
      matchDepTypes: [`dependencies`],
      matchUpdateTypes: [`patch`, `minor`],
      groupName: `minor and patch dependencies for ${pkg}`,
      groupSlug: `${pkg}-prod-minor`,
    },
    {
      matchPaths: [`packages/${pkg}/package.json`],
      matchDepTypes: [`dependencies`],
      matchUpdateTypes: [`major`],
      groupName: `major dependencies for ${pkg}`,
      groupSlug: `${pkg}-prod-major`,
    },
    // all deps below <1.0.0 will get special treatment.
    {
      matchPaths: [`packages/${pkg}/package.json`],
      matchDepTypes: [`dependencies`],
      groupName: `minor and patch dependencies for ${pkg}`,
      groupSlug: `${pkg}-prod-minor`,
      matchPackageNames: preFirstMajorPackages,
      matchUpdateTypes: [`patch`],
    },
    {
      matchPaths: [`packages/${pkg}/package.json`],
      matchDepTypes: [`dependencies`],
      groupName: `major dependencies for ${pkg}`,
      groupSlug: `${pkg}-prod-major`,
      matchPackageNames: preFirstMajorPackages,
      matchUpdateTypes: [`major`, `minor`],
    },
  ]

  packageRules.set(pkg, packageRule)
})

const renovateConfig = {
  extends: [
    `:separateMajorReleases`,
    `:combinePatchMinorReleases`,
    `:ignoreUnstable`,
    `:prImmediately`,
    `:semanticPrefixFixDepsChoreOthers`,
    `:automergeDisabled`,
    `:disablePeerDependencies`,
    `:maintainLockFilesDisabled`,
    `:disableRateLimiting`,
    `:label(topic: automation)`,
    `:ignoreModulesAndTests`,
    `:enableVulnerabilityAlerts`,
  ],
  includePaths: [`package.json`, `packages/**`, `starters/**`, `examples/**`],
  major: {
    dependencyDashboardApproval: true,
  },
  dependencyDashboard: true,
  ignoreDeps: [`react`, `react-dom`],
  rangeStrategy: `bump`,
  bumpVersion: null,
  prHourlyLimit: 0,
  // Wait for 2 days to update a package so we can check if it's stable
  stabilityDays: 2,
  postUpdateOptions: [`yarnDedupeHighest`],
  timezone: `GMT`,
  schedule: [`before 7am on the first day of the month`],
  packageRules: defaultPackageRules.concat(
    Array.from(packageRules.values()).flat()
  ),
}

fs.writeJSONSync(path.join(ROOT_DIR, `renovate.json5`), renovateConfig, {
  spaces: 2,
})
