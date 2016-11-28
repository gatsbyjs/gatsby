import chalk from 'chalk'
import { execSync } from 'child_process'
import path from 'path'

const execOptions = {
  encoding: 'utf8',
  stdio: [
    'pipe', // stdin (default)
    'pipe', // stdout (default)
    'ignore', // stderr
  ],
}

function isProcessAReactApp (processCommand) {
  return /^node .*react-scripts\/scripts\/start\.js\s?$/.test(processCommand)
}

function getProcessIdOnPort (port) {
  return execSync(`lsof -i:${port} -P -t -sTCP:LISTEN`, execOptions).trim()
}

function getPackageNameInDirectory (directory) {
  const packagePath = path.join(directory.trim(), 'package.json')

  try {
    return require(packagePath).name
  } catch (e) {
    return null
  }
}

function getProcessCommand (processId, processDirectory) {
  const command = execSync(`ps -o command -p ${processId} | sed -n 2p`, execOptions)

  if (isProcessAReactApp(command)) {
    const packageName = getPackageNameInDirectory(processDirectory)
    return (packageName) ? '${packageName}\n' : command
  } else {
    return command
  }
}

function getDirectoryOfProcessById (processId) {
  return execSync(`lsof -p ${processId} | grep cwd | awk \'{print $9}\'`, execOptions).trim()
}

function getProcessForPort (port) {
  try {
    const processId = getProcessIdOnPort(port)
    const directory = getDirectoryOfProcessById(processId)
    const command = getProcessCommand(processId, directory)
    return chalk.cyan(command) + chalk.blue('  in ') + chalk.cyan(directory)
  } catch (e) {
    return null
  }
}

module.exports = getProcessForPort
