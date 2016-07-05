import fs from 'fs-extra'
import path from 'path'
import cheerio from 'cheerio'
import Promise from 'bluebird'
import _ from 'lodash'
import { spawn as spawnNative } from 'child_process'
const remove = Promise.promisify(fs.remove)
const gatsbyCli = path.resolve('..', '..', 'lib', 'bin', 'cli.js')
const babel = path.resolve('..', '..', 'node_modules', '.bin', 'babel-node')

export function spawn (command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const child = spawnNative(command, args, options)
    child.stdout.on('data', data => { stdout += data })
    child.stderr.on('data', data => { stderr += data })
    child.on('error', error => reject({ error, stderr, stdout }))
    child.on('exit', code => {
      if (code === 0) {
        resolve({ code, stdout, stderr })
      } else {
        reject({ code, stdout, stderr })
      }
    })
  })
}

export function gatsby (args = [], options = {}) {
  const spawnArguments = _.concat(['--', gatsbyCli], args)
  return spawn(babel, spawnArguments, options)
}

export function build (fixturePath) {
  const buildPath = path.resolve(fixturePath, 'public')
  return remove(buildPath)
    .then(() => gatsby(['build'], { cwd: fixturePath }))
}

export function dom (filePath) {
  const readFile = Promise.promisify(fs.readFile)
  return readFile(filePath)
    .then(html => cheerio.load(html))
}
