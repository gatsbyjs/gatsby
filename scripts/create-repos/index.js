#!/usr/bin/env node
const path = require(`path`)
const yargs = require(`yargs`)
const fs = require(`fs-extra`)
const fetch = require(`isomorphic-fetch`)

const BASE_DIRECTORY = `examples`

const args = yargs
  .option(`token`, {
    demand: true,
    type: `string`,
    describe: `The auth token generated with https://github.com/settings/tokens`,
  })
  .option(`repos`, {
    type: `array`,
    default: [],
    describe: `repos to create at {organization}/{repo_name}, e.g. gatsbyjs/gatsby-starter-styled-components`,
  })
  .option(`prefix`, {
    type: `string`,
    default: `gatsby-starter`,
  })
  .option(`organization`, {
    alias: `org`,
    type: `string`,
    default: `gatsbyjs`,
    describe: `a custom organization to create the repo`,
  }).argv

function createRepos({ repos, prefix, organization, token }) {
  return Promise.all(
    repos.map(repo => {
      const name = [prefix, repo.replace(`using-`, ``)].join(`-`)
      return fetch(`https://api.github.com/orgs/${organization}/repos`, {
        method: `POST`,
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": `application/json`,
        },
        body: JSON.stringify({
          name,
        }),
      }).then(res => {
        const { ok, status, statusText } = res
        if (!ok || status !== 201) {
          return res.json().then(({ errors, message }) => {
            const error = errors ? errors.shift() : statusText
            if (error.message.match(`already exists`)) {
              return Promise.resolve(
                `${organization}/${name} (already existed)`
              )
            }
            return Promise.reject(message || statusText)
          })
        }
        return `${organization}/${name}`
      })
    })
  ).then(repos => {
    console.log(`Created the following repos:`)
    console.log(repos.map(repo => `  - ${repo}`).join(`\n`))
  })
}

async function main() {
  try {
    if (args.repos && args.repos.length > 0) {
      return await createRepos(args)
    }

    const base = path.resolve(BASE_DIRECTORY)

    const starters = await fs
      .readdir(base)
      .then(dirs =>
        dirs.filter(dir => fs.statSync(path.join(base, dir)).isDirectory())
      )

    return createRepos(
      Object.assign(args, {
        repos: starters,
      })
    )
  } catch (e) {
    console.error(e)
    return null
  }
}

main()
