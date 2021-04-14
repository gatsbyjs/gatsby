#!/usr/bin/env node
const path = require('path')
const globby = require('globby')
const { sortBy, uniq } = require("lodash");
const loadThemes = require("gatsby/dist/bootstrap/load-themes");
const { distance: levenshtein } = require('fastest-levenshtein')

let errorsFound = []

const KNOWN_FS_TYPOS = [
  'src/gastby-theme-*/**/*.js',
  'src/gastby-plugin-*/**/*.js'
]

const checkGastbyFiles = () => {
  const files = globby.sync(KNOWN_FS_TYPOS)

  if (files.length) {
    errorsFound.push('The following files were encountered with "Gatsby" misspelled as "Gastby"', files)
  }
}

const getThemes = async () => {
  const config = require(path.join(
    process.cwd(),
    "gatsby-config.js"
  ), "utf-8");

  const configWithThemes = await loadThemes(config, {
    useLegacyThemes: false
  });

  return sortBy(
    uniq(configWithThemes.config.plugins.map(({ resolve }) => resolve))
  )
    .filter(t => t.startsWith('gatsby-theme-'))
}

const getAllShadowableThemeFiles = theme => {
  const themeSrc = path.join(path.dirname(require.resolve(theme)), `src`);
  return globby.sync(`**/*.*`, {
    cwd: themeSrc
  });
}

const findClosestFile = (fileName, files) => {
  const sorted = files.sort((a, b) => {
    const levValA = levenshtein(fileName, a)
    const levValB = levenshtein(fileName, b)

    if (levValA < levValB) return -1
    if (levValA > levValB) return 1
    return 0
  })

  return sorted[0]
}

const checkShadowedFileMatch = async theme => {
  const shadowableFiles = await getAllShadowableThemeFiles(theme)

  const shadowedFiles = globby.sync(`**/*.*`, {
    cwd: path.join(process.cwd(), 'src', theme)
  });

  shadowedFiles.map(f => {
    if (!shadowableFiles.includes(f)) {
      const closestFile = findClosestFile(f, shadowableFiles)
      errorsFound.push(
        `No shadowable file found for: ${f}, did you mean ${closestFile}`
      )
    }
  })
}

const logErrors = () => {
  if (errorsFound.length) {
    console.log('Found', errorsFound.length, errorsFound.length === 1 ? 'error' : 'errors')
    console.log(errorsFound)
  } else {
    console.log('No errors found!')
  }
}

;(async () => {
  const themes = await getThemes()
  checkGastbyFiles()

  //console.log(themes)

  const themesShadowing = themes.map(async t => {
    await checkShadowedFileMatch(t)
  })

  await Promise.all(themesShadowing)

  logErrors()
})();
