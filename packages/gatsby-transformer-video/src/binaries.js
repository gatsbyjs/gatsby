import { resolve } from "path"

import execa from "execa"
import { access, ensureDir } from "fs-extra"
import reporter from "gatsby-cli/lib/reporter"

export async function libsInstalled({ platform }) {
  try {
    const isInstalledCommand = platform === `win32` ? `WHERE` : `command`
    const isInstalledParams = platform === `win32` ? [] : [`-v`]
    await execa(isInstalledCommand, [...isInstalledParams, `ffmpeg`])
    await execa(isInstalledCommand, [...isInstalledParams, `ffprobe`])
    return true
  } catch {
    return false
  }
}

export async function libsAlreadyDownloaded({ binariesDir }) {
  await access(resolve(binariesDir, `ffmpeg`))
  await access(resolve(binariesDir, `ffprobe`))
}

export async function downloadLibs({ binariesDir, platform }) {
  const execaConfig = {
    cwd: binariesDir,
    stdout: `inherit`,
    stderr: `inherit`,
  }

  await ensureDir(binariesDir)

  switch (platform) {
    case `win32`:
      reporter.info(
        `Downloading FFMPEG && FFPROBE (Note: This script is not yet tested on windows)`
      )
      await execa(
        `curl`,
        [
          `-L`,
          `-o`,
          `ffmpeg.zip`,
          `https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-latest-win64-static.zip`,
        ],
        execaConfig
      )

      reporter.info(`Unzipping FFMPEG && FFPROBE`)
      await execa(`tar`, [`-xf`, `ffmpeg.zip`], execaConfig)

      reporter.info(`Cleanup`)
      await execa(`mv`, [`bin/*`, `.`], execaConfig)
      await execa(`rm`, [`-rf`, `ffmpeg-latest-win64-static`], execaConfig)
      break
    case `linux`:
      reporter.info(`Downloading FFMPEG && FFPROBE`)
      await execa(
        `wget`,
        [
          `-O`,
          `-nv`,
          `ffmpeg.zip`,
          `https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz`,
        ],
        execaConfig
      )

      reporter.info(`Unzipping FFMPEG && FFPROBE`)
      await execa(`tar`, [`-xf`, `ffmpeg.zip`, `--strip`, `1`], execaConfig)

      reporter.info(`Cleanup`)
      await execa(`rm`, [`ffmpeg.zip`], execaConfig)
      break
    case `darwin`:
      reporter.info(`Downloading FFMPEG`)

      await execa(
        `curl`,
        [
          `-L`,
          `-J`,
          `-o`,
          `ffmpeg.zip`,
          `https://evermeet.cx/ffmpeg/getrelease/zip`,
        ],
        execaConfig
      )

      reporter.info(`Downloading FFPROBE`)
      await execa(
        `curl`,
        [
          `-L`,
          `-o`,
          `ffprobe.zip`,
          `https://evermeet.cx/ffmpeg/getrelease/ffprobe/zip`,
        ],
        execaConfig
      )

      reporter.info(`Unzipping...`)
      await execa(`unzip`, [`-o`, `ffmpeg.zip`], execaConfig)
      await execa(`unzip`, [`-o`, `ffprobe.zip`], execaConfig)

      reporter.info(`Cleanup...`)
      await execa(`rm`, [`ffmpeg.zip`, `ffprobe.zip`], execaConfig)
      break
    default:
      throw new Error(`Downloading FFMPEG for ${platform} is not supported`)
  }
}
