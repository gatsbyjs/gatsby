import { resolve } from "path"

import execa from "execa"
import { access, ensureDir } from "fs-extra"

export async function libsAlreadyInstalled({ platform }) {
  const isInstalledCommand = platform === `win32` ? `WHERE` : `command`
  const isInstalledParams = platform === `win32` ? [] : [`-v`]
  await execa(isInstalledCommand, [...isInstalledParams, `ffmpeg`])
  await execa(isInstalledCommand, [...isInstalledParams, `ffprobe`])
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
      console.log(
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

      console.log(`Unzipping FFMPEG && FFPROBE`)
      await execa(`tar`, [`-xf`, `ffmpeg.zip`], execaConfig)

      console.log(`Cleanup`)
      await execa(`mv`, [`bin/*`, `.`], execaConfig)
      await execa(`rm`, [`-rf`, `ffmpeg-latest-win64-static`], execaConfig)
      break
    case `linux`:
      console.log(`Downloading FFMPEG && FFPROBE`)
      await execa(
        `wget`,
        [
          `-O`,
          `ffmpeg.zip`,
          `https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz`,
        ],
        execaConfig
      )

      console.log(`Unzipping FFMPEG && FFPROBE`)
      await execa(`tar`, [`-xf`, `ffmpeg.zip`, `--strip`, `1`], execaConfig)

      console.log(`Cleanup`)
      await execa(`rm`, [`ffmpeg.zip`], execaConfig)
      break
    case `darwin`:
      console.log(`Downloading FFMPEG`)

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

      console.log(`Downloading FFPROBE`)
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

      console.log(`Unzipping...`)
      await execa(`unzip`, [`-o`, `ffmpeg.zip`], execaConfig)
      await execa(`unzip`, [`-o`, `ffprobe.zip`], execaConfig)

      console.log(`Cleanup...`)
      await execa(`rm`, [`ffmpeg.zip`, `ffprobe.zip`], execaConfig)
      break
    default:
      throw new Error(`Downloading FFMPEG for ${platform} is not supported`)
  }
}
