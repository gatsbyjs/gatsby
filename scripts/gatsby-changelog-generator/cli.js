const yargs = require(`yargs`)
const {
  getAllPackageNames,
  regenerateChangelog,
  updateChangelog,
} = require(`./generate`)

const _argv = yargs
  .command(
    `regenerate <pkg>`,
    `Regenerates changelog of a given package`,
    commandBuilder =>
      commandBuilder.positional(`pkg`, {
        type: `string`,
        desc: `package name`,
        demandOption: true,
      }),
    async ({ pkg }) => {
      // Needs to be called to fill the packageNameToDirname map
      getAllPackageNames()
      await regenerateChangelog(pkg)
    }
  )
  .command(
    `regenerate-all`,
    `Regenerate changelogs of all packages in the monorepo (slow)`,
    () => undefined,
    async () => {
      for (const pkg of getAllPackageNames()) {
        try {
          await regenerateChangelog(pkg)
        } catch (e) {
          console.error(`${pkg}: ${e.stack}`)
        }
      }
    }
  )
  .command(
    `update <pkg>`,
    `Add new versions to the changelog of a given package`,
    commandBuilder =>
      commandBuilder.positional(`pkg`, {
        type: `string`,
        desc: `package name`,
        demandOption: true,
      }),
    async ({ pkg }) => {
      // Needs to be called to fill the packageNameToDirname map
      getAllPackageNames()
      await updateChangelog(pkg)
    }
  )
  .command(
    `update-all`,
    `Update changelogs of all packages in the monorepo`,
    () => undefined,
    async () => {
      for (const pkg of getAllPackageNames()) {
        try {
          await updateChangelog(pkg)
        } catch (e) {
          console.error(`${pkg}: ${e.stack}`)
        }
      }
    }
  )
  .version(`1.0.0`)
  .strictCommands()
  .demandCommand(1).argv
