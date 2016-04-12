import fs from 'fs'
import cheerio from 'cheerio'
import Promise from 'bluebird'
import { spawn as spawnNative } from 'child_process'

export function spawn (command, args, options) {
  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const child = spawnNative(command, args, options)
    child.on('exit', code => resolve({ code, stdout }))
    child.on('error', error => reject({ error, stderr }))
    child.stdout.on('data', data => { stdout += data })
    child.stderr.on('data', data => { stderr += data })
  })
}

export function dom (path) {
  const readFile = Promise.promisify(fs.readFile)
  return readFile(path)
    .then(html => cheerio.load(html))
}
