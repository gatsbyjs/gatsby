const ESC = `\u001b`

export const clearLine = (count = 1): Promise<void> =>
  new Promise(resolve => {
    // First move the cursor up one line...
    process.stderr.moveCursor(0, -count, () => {
      // ... then clear that line. This is the ANSI escape sequence for "clear whole line"
      // List of escape sequences: http://ascii-table.com/ansi-escape-sequences.php
      process.stderr.write(`${ESC}[2K`)
      resolve()
    })
  })

// Makes a string safe for using as a folder or npm package name
export const makeNpmSafe = (str: string): string =>
  str
    // Replace camelcase with kebab
    .replace(/([a-z])([A-Z])/g, `$1-$2`)
    .toLowerCase()
    // Replace any number of consecutive illegal characters with a single dash
    .replace(/[^a-z0-9_.]+/g, `-`)
    // Remove trailing dots and dashes
    .replace(/^[_\-.]+|[_\-.]+$/g, ``)
