const ESC = `\u001b`

export const clearLine = (count = 1): Promise<boolean> =>
  new Promise(resolve => {
    // First move the cursor up one line...
    process.stderr.moveCursor(0, -count, () => {
      // ... then clear that line. This is the ANSI escape sequence for "clear whole line"
      // List of escape sequences: http://ascii-table.com/ansi-escape-sequences.php
      process.stderr.write(`${ESC}[2K`)
      resolve()
    })
  })

export const kebabify = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, `$1-$2`)
    .replace(/[^a-zA-Z]+/g, `-`)
    .toLowerCase()
