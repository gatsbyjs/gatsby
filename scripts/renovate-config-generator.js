const path = require(`path`)
const glob = require(`glob`)
const fs = require(`fs-extra`)

const ROOT_DIR = path.join(__dirname, `..`)
const packageRules = new Map()

const globalPackageRules = [
  // bundle well known monorepos
  {
    groupName: `babel monorepo`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchSourceUrlPrefixes: [`https://github.com/babel/babel`],
  },
  {
    groupName: `lodash monorepo`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchSourceUrlPrefixes: [`https://github.com/lodash`],
  },
  {
    groupName: `gatsby monorepo`,
    groupSlug: `gatsby-monorepo`,
    matchPaths: [`+(package.json)`],
    dependencyDashboardApproval: false,
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    commitMessageTopic: `dependencies for Gatsby monorepo`,
    excludePackagePatterns: [`^@babel`],
  },

  // group eslint & prettier
  {
    groupName: `formatting & linting`,
    commitMessageTopic: `Formatting & linting`,
    matchPaths: [`+(package.json)`],
    matchPackageNames: [`eslint`, `prettier`],
    matchPackagePatterns: [`^eslint-`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },

  // some widely used packages
  {
    groupName: `cross-env`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackageNames: [`cross-env`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `execa`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackageNames: [`execa`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `mini-css-extract-plugin`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackageNames: [`mini-css-extract-plugin`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
  },
  {
    groupName: `sharp`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackageNames: [`sharp`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
  },
  {
    groupName: `typescript`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackageNames: [`typescript`],
    matchPackagePatterns: [`^@typescript-eslint/`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `cypress`,
    matchPaths: [`e2e-tests/**/package.json`, `examples/**/package.json`],
    matchPackageNames: [`cypress`, `cypress-image-snapshot`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `chalk`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackageNames: [`chalk`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `fs-extra`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackageNames: [`fs-extra`, `@types/fs-extra`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `testing library`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackagePatterns: [`^@testing-library/`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `cheerio`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackageNames: [`cheerio`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `semver`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackageNames: [`semver`, `@types/semver`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `core-js`,
    matchPaths: [
      `+(package.json)`,
      `packages/!(gatsby-legacy-polyfills)/**/package.json`,
    ],
    matchPackageNames: [`core-js`, `core-js-compat`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `chokidar`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackageNames: [`chokidar`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `Parcel`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackagePatterns: [`^@parcel/`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
  {
    groupName: `lmdb`,
    matchPaths: [`+(package.json)`, `packages/**/package.json`],
    matchPackagePatterns: [`lmdb`],
    matchUpdateTypes: [`major`, `minor`, `patch`],
    matchDepTypes: [`dependencies`, `devDependencies`],
    dependencyDashboardApproval: false,
  },
]

// there is no excludeMatchSourceUrlPrefixes option so we force babel to be disabled
const globalExcludePackages = []
const globalExcludePackagePatterns = [`^@babel`]
globalPackageRules.forEach(group => {
  if (group.matchPackagePatterns) {
    globalExcludePackagePatterns.push(...group.matchPackagePatterns)
  }
  if (group.matchPackageNames) {
    globalExcludePackages.push(...group.matchPackageNames)
  }
})

// our default rules
const defaultPackageRules = [
  // disable engine upgrades & types/node
  {
    matchDepTypes: [`engines`, `@types/node`],
    enabled: false,
  },
  // host-error on renovate :shrug:
  // {
  //   matchPackageNames: [`gatsby-interface`],
  //   // update internal packages immediately after publish instead of waiting 3 days
  //   stabilityDays: 0,
  // },

  // update our examples and starters automatically
  {
    groupName: `starters and examples`,
    commitMessageTopic: `starters and examples`,
    groupSlug: `starters-examples-minor`,
    matchPaths: [`starters/**`, `examples/**`],
    schedule: `before 7am on Monday`,
    matchUpdateTypes: [`patch`, `minor`],
  },
  {
    extends: [`monorepo:gatsby`],
    commitMessageTopic: `starters and examples Gatsby packages`,
    groupName: `starters and examples - Gatsby`,
    groupSlug: `starters-examples-gatsby-minor`,
    matchPaths: [`starters/**`, `examples/**`],
    automerge: true,
    stabilityDays: 0,
    prPriority: 50,
    schedule: `at any time`,
    matchUpdateTypes: [`patch`, `minor`],
  },
  {
    groupName: `starters and examples`,
    commitMessageTopic: `starters and examples`,
    matchPaths: [`starters/**`, `examples/**`],
    schedule: `before 7am on Monday`,
    matchUpdateTypes: [`major`],
    groupSlug: `starters-examples-major`,
    dependencyDashboardApproval: false,
  },
  {
    groupName: `E2E tests`,
    commitMessageTopic: `e2e-tests`,
    matchPaths: [`e2e-tests/**`],
    schedule: `before 7am on Monday`,
    matchUpdateTypes: [`major`],
    groupSlug: `e2e-tests-major`,
    dependencyDashboardApproval: false,
  },
  {
    extends: [`monorepo:gatsby`],
    commitMessageTopic: `starters and examples Gatsby packages`,
    groupName: `starters and examples - Gatsby`,
    matchPaths: [`starters/**`, `examples/**`],
    stabilityDays: 0,
    prPriority: 50,
    schedule: `at any time`,
    matchUpdateTypes: [`major`],
    groupSlug: `starters-examples-gatsby-major`,
    dependencyDashboardApproval: false,
  },

  ...globalPackageRules,
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
        !monorepoPackages.includes(dep) &&
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
      excludePackageNames: globalExcludePackages,
      excludePackagePatterns: globalExcludePackagePatterns,
      // When only one package get updated the groupName is not used and you don't know which plugin in the monorepo gets updated
      // ex: chore(deps): update dependency katex to ^0.13.11
      commitMessageSuffix: `{{#unless groupName}} for ${pkg}{{/unless}}`,
    },
    {
      matchPaths: [`packages/${pkg}/package.json`],
      matchDepTypes: [`devDependencies`],
      matchUpdateTypes: [`major`],
      groupName: `[DEV] major dependencies for ${pkg}`,
      groupSlug: `${pkg}-dev-major`,
      automerge: true,
      dependencyDashboardApproval: false,
      excludePackageNames: globalExcludePackages,
      excludePackagePatterns: globalExcludePackagePatterns,
      commitMessageSuffix: `{{#unless groupName}} for ${pkg}{{/unless}}`,
    },
    {
      matchPaths: [`packages/${pkg}/package.json`],
      matchDepTypes: [`dependencies`],
      matchUpdateTypes: [`patch`, `minor`],
      groupName: `minor and patch dependencies for ${pkg}`,
      groupSlug: `${pkg}-prod-minor`,
      excludePackageNames: globalExcludePackages,
      excludePackagePatterns: globalExcludePackagePatterns,
      commitMessageSuffix: `{{#unless groupName}} for ${pkg}{{/unless}}`,
    },
    {
      matchPaths: [`packages/${pkg}/package.json`],
      matchDepTypes: [`dependencies`],
      matchUpdateTypes: [`major`],
      groupName: `major dependencies for ${pkg}`,
      groupSlug: `${pkg}-prod-major`,
      excludePackageNames: globalExcludePackages,
      excludePackagePatterns: globalExcludePackagePatterns,
      commitMessageSuffix: `{{#unless groupName}} for ${pkg}{{/unless}}`,
      dependencyDashboardApproval: true,
    },
    // all deps below <1.0.0 will get special treatment.
    {
      matchPaths: [`packages/${pkg}/package.json`],
      matchDepTypes: [`dependencies`],
      groupName: `minor and patch dependencies for ${pkg}`,
      groupSlug: `${pkg}-prod-minor`,
      matchPackageNames: preFirstMajorPackages,
      matchUpdateTypes: [`patch`],
      excludePackageNames: globalExcludePackages,
      excludePackagePatterns: globalExcludePackagePatterns,
      commitMessageSuffix: `{{#unless groupName}} for ${pkg}{{/unless}}`,
    },
    {
      matchPaths: [`packages/${pkg}/package.json`],
      matchDepTypes: [`dependencies`],
      groupName: `major dependencies for ${pkg}`,
      groupSlug: `${pkg}-prod-major`,
      matchPackageNames: preFirstMajorPackages,
      matchUpdateTypes: [`major`, `minor`],
      excludePackageNames: globalExcludePackages,
      excludePackagePatterns: globalExcludePackagePatterns,
      commitMessageSuffix: `{{#unless groupName}} for ${pkg}{{/unless}}`,
      dependencyDashboardApproval: true,
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
  includePaths: [
    `package.json`,
    `packages/**`,
    `starters/**`,
    `examples/**`,
    `e2e-tests/**`,
  ],
  major: {
    dependencyDashboardApproval: true,
  },
  dependencyDashboard: true,
  ignoreDeps: [`react`, `react-dom`, `uuid`, `gatsby-interface`],
  rangeStrategy: `bump`,
  bumpVersion: null,
  prHourlyLimit: 0,
  // Wait for 2 days to update a package so we can check if it's stable
  stabilityDays: 2,
  postUpdateOptions: [`yarnDedupeHighest`],
  timezone: `GMT`,
  schedule: [`before 7am on the first day of the month`],
  updateNotScheduled: false,
  packageRules: defaultPackageRules.concat(
    Array.from(packageRules.values()).flat()
  ),
  force: {
    constraints: {
      node: `>=18.0.0`,
      npm: `>=8.0.0`,
    },
  },
}

fs.writeJSONSync(path.join(ROOT_DIR, `renovate.json5`), renovateConfig, {
  spaces: 2,
})
