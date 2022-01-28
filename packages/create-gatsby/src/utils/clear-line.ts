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
